import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { mapBookmark, mapReservation } from "@/lib/data-mappers";
import type { AssistantAction, AssistantResponse, ChatTurn, HotelResult, Reservation, RequestedField, SearchContext } from "@/lib/models";
import { searchHotels } from "@/lib/xotelo";

type Message = { role: "system" | "user" | "assistant" | "tool"; content: string | null; tool_call_id?: string; tool_calls?: ToolCall[] };
type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };

const MODEL_PRIORITY = ["google/gemini-3.7-flash", "openai/gpt-5.4-mini"];
const modes = ["clarification", "hotel_results", "reservation_confirmation", "reservation_list", "reservation_detail", "bookmarks", "status"];
const fields: RequestedField[] = ["destination", "dates", "guests", "rooms", "budget", "atmosphere", "amenities", "accessibility"];

const SYSTEM_PROMPT = `You are StayAI, a concise, discerning accommodation concierge.
You help a signed-in demo user discover real hotels through Xotelo and understand their saved demo reservations.

Rules:
- Never invent a hotel, price, rating, availability, reservation, or booking reference.
- Use search_hotels before presenting hotels. Hotels in the final response are replaced server-side with tool data.
- Ask only for information genuinely missing from the user's request. Put those exact inputs in requestedFields.
- Dates must be ISO YYYY-MM-DD when calling tools. Assume EUR unless the user provides another currency.
- A StayAI reservation is an internal demonstration record only. Never say a hotel, OTA, room, or inventory has been secured.
- To reserve a hotel already returned by search_hotels, call prepare_reservation. Never claim it is created until the interface confirms it.
- To reactivate a cancelled reservation, first identify it with list_reservations, then call prepare_reactivation. Never claim it is active until the interface confirms it.
- The model never directly mutates data. Reservation tools prepare a deterministic confirmation action; the interface performs the write after explicit confirmation.
- When the user asks about existing reservations or saved hotels, use the matching read tool.
- Return only the structured JSON response requested by the schema. Keep reply polished and brief.`;

const tools = [
  {
    type: "function",
    function: {
      name: "search_hotels",
      description: "Search Xotelo for hotels and optionally live rates. Call only when a destination is known.",
      parameters: {
        type: "object",
        additionalProperties: false,
        required: ["destination"],
        properties: {
          destination: { type: "string" }, checkIn: { type: "string" }, checkOut: { type: "string" },
          adults: { type: "integer", minimum: 1 }, children: { type: "integer", minimum: 0 },
          childAges: { type: "array", items: { type: "integer", minimum: 0, maximum: 17 } },
          pets: { type: "integer", minimum: 0 }, rooms: { type: "integer", minimum: 1 }, currency: { type: "string" },
          budget: { type: "string" }, atmosphere: { type: "array", items: { type: "string" } },
          amenities: { type: "array", items: { type: "string" } }, accessibility: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
  { type: "function", function: { name: "list_reservations", description: "List the signed-in user's real stored demo reservations.", parameters: { type: "object", additionalProperties: false, properties: {} } } },
  { type: "function", function: { name: "list_bookmarks", description: "List the signed-in user's saved hotels.", parameters: { type: "object", additionalProperties: false, properties: {} } } },
  {
    type: "function",
    function: {
      name: "prepare_reservation",
      description: "Prepare explicit confirmation for a hotel already shown in this conversation. Dates must already be known.",
      parameters: {
        type: "object",
        additionalProperties: false,
        required: ["hotelKey"],
        properties: { hotelKey: { type: "string", description: "Exact hotel key from the conversation inventory." } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "prepare_reactivation",
      description: "Prepare explicit confirmation to reactivate one of the signed-in user's cancelled demo reservations.",
      parameters: {
        type: "object",
        additionalProperties: false,
        required: ["reference"],
        properties: { reference: { type: "string", description: "Exact reservation reference returned by list_reservations." } },
      },
    },
  },
] as const;

const responseFormat = {
  type: "json_schema",
  json_schema: {
    name: "stayai_response",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["reply", "mode", "requestedFields"],
      properties: {
        reply: { type: "string" },
        mode: { type: "string", enum: modes },
        requestedFields: { type: "array", uniqueItems: true, items: { type: "string", enum: fields } },
        searchContext: {
          type: ["object", "null"],
          additionalProperties: false,
          properties: {
            destination: { type: ["string", "null"] }, checkIn: { type: ["string", "null"] }, checkOut: { type: ["string", "null"] },
            adults: { type: ["integer", "null"] }, children: { type: ["integer", "null"] }, pets: { type: ["integer", "null"] },
            rooms: { type: ["integer", "null"] }, currency: { type: ["string", "null"] }, budget: { type: ["string", "null"] },
            atmosphere: { type: ["array", "null"], items: { type: "string" } }, amenities: { type: ["array", "null"], items: { type: "string" } },
            accessibility: { type: ["array", "null"], items: { type: "string" } },
          },
        },
      },
    },
  },
};

async function completion(messages: Message[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("StayAI needs an OpenRouter API key before it can answer.");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3001",
      "X-Title": process.env.OPENROUTER_APP_NAME || "StayAI",
    },
    body: JSON.stringify({ models: MODEL_PRIORITY, messages, tools, tool_choice: "auto", response_format: responseFormat, temperature: 0.2 }),
    signal: AbortSignal.timeout(40_000),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenRouter returned ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ""}`);
  }
  const payload = await response.json();
  const message = payload?.choices?.[0]?.message;
  if (!message) throw new Error("OpenRouter returned an empty response.");
  return message as Message;
}

function parseArguments(value: string) {
  try {
    const parsed = JSON.parse(value || "{}") as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  }
  catch { throw new Error("The assistant produced invalid tool arguments."); }
}

function optionalText(value: unknown, max = 160) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined;
}

function optionalInteger(value: unknown, minimum: number, maximum: number) {
  return Number.isInteger(value) ? Math.min(maximum, Math.max(minimum, value as number)) : undefined;
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).slice(0, 12).map((item) => item.trim().slice(0, 80))
    : undefined;
}

function validDate(value: unknown) {
  const date = optionalText(value, 10);
  return date && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) ? date : undefined;
}

function searchContextFromArguments(args: Record<string, unknown>): SearchContext {
  const destination = optionalText(args.destination, 120);
  if (!destination) throw new Error("StayAI needs a valid destination before searching.");
  const context: SearchContext = {
    destination,
    checkIn: validDate(args.checkIn),
    checkOut: validDate(args.checkOut),
    adults: optionalInteger(args.adults, 1, 32),
    children: optionalInteger(args.children, 0, 20),
    pets: optionalInteger(args.pets, 0, 20),
    rooms: optionalInteger(args.rooms, 1, 8),
    currency: optionalText(args.currency, 3)?.toUpperCase(),
    budget: optionalText(args.budget, 80),
    atmosphere: stringList(args.atmosphere),
    amenities: stringList(args.amenities),
    accessibility: stringList(args.accessibility),
  };
  if (Array.isArray(args.childAges)) {
    context.childAges = args.childAges.filter((age): age is number => Number.isInteger(age) && age >= 0 && age <= 17).slice(0, 20);
  }
  if (context.checkIn && context.checkOut && context.checkOut <= context.checkIn) throw new Error("Check-out must be after check-in.");
  return context;
}

function parseAssistantResponse(content: string): AssistantResponse {
  let value: unknown;
  try { value = JSON.parse(content); }
  catch { throw new Error("StayAI returned a response that could not be displayed safely."); }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("StayAI returned an invalid response shape.");
  const candidate = value as Partial<AssistantResponse>;
  if (typeof candidate.reply !== "string" || !candidate.reply.trim() || !modes.includes(candidate.mode || "")) {
    throw new Error("StayAI returned an invalid response shape.");
  }
  if (!Array.isArray(candidate.requestedFields)) throw new Error("StayAI returned an invalid response shape.");
  return {
    reply: candidate.reply.trim().slice(0, 6_000),
    mode: candidate.mode!,
    requestedFields: [...new Set(candidate.requestedFields.filter((field): field is RequestedField => fields.includes(field as RequestedField)))],
    searchContext: candidate.searchContext,
  };
}

export async function runStayAiAgent({
  message,
  history,
  supabase,
  onStatus,
}: {
  message: string;
  history: ChatTurn[];
  supabase: SupabaseClient<Database>;
  onStatus: (label: string) => void;
}) {
  const knownHotelEntries = history.flatMap((turn) => (turn.response?.hotels || []).map((hotel) => ({ hotel, context: turn.response?.searchContext })));
  const knownReservations = history.flatMap((turn) => turn.response?.reservations || []);
  const inventory = {
    hotels: knownHotelEntries.map(({ hotel, context }) => ({ hotelKey: hotel.hotelKey, name: hotel.name, dates: context?.checkIn && context.checkOut ? `${context.checkIn}/${context.checkOut}` : null })),
    reservations: knownReservations.map((reservation) => ({ id: reservation.id, reference: reservation.reference, hotelName: reservation.hotelName, status: reservation.status })),
  };
  const messages: Message[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: `Conversation inventory (server-sourced; use exact identifiers only): ${JSON.stringify(inventory)}` },
    ...history.slice(-12).map((turn) => ({ role: turn.role, content: turn.text }) as Message),
    { role: "user", content: message },
  ];
  let sourcedHotels: HotelResult[] | undefined;
  let sourcedReservations: Reservation[] | undefined;
  let sourcedBookmarks: HotelResult[] | undefined;
  let sourcedSearchContext: SearchContext | undefined;
  let preparedAction: AssistantAction | undefined;

  for (let round = 0; round < 6; round += 1) {
    const assistant = await completion(messages);
    messages.push(assistant);
    const calls = assistant.tool_calls || [];
    if (!calls.length) {
      if (!assistant.content) throw new Error("StayAI returned no reply.");
      const parsed = parseAssistantResponse(assistant.content);
      if (sourcedHotels) parsed.hotels = sourcedHotels;
      if (sourcedReservations) parsed.reservations = sourcedReservations;
      if (sourcedBookmarks) parsed.hotels = sourcedBookmarks;
      if (sourcedSearchContext) parsed.searchContext = sourcedSearchContext;
      if (preparedAction) parsed.actions = [preparedAction];
      return parsed;
    }

    for (const call of calls) {
      const args = parseArguments(call.function.arguments);
      let result: unknown;
      if (call.function.name === "search_hotels") {
        onStatus("Searching Xotelo for the strongest matches");
        sourcedSearchContext = searchContextFromArguments(args);
        sourcedHotels = await searchHotels(sourcedSearchContext);
        result = sourcedHotels;
        onStatus(sourcedHotels.some((hotel) => hotel.rate) ? "Current rates checked" : "Hotels found — rates may need dates");
      } else if (call.function.name === "list_reservations") {
        onStatus("Opening your reservations");
        const { data, error } = await supabase.from("reservations").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        sourcedReservations = (data || []).map(mapReservation);
        result = sourcedReservations;
      } else if (call.function.name === "list_bookmarks") {
        onStatus("Opening your saved stays");
        const { data, error } = await supabase.from("bookmarks").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        sourcedBookmarks = (data || []).map(mapBookmark).map((bookmark) => bookmark.hotel);
        result = sourcedBookmarks;
      } else if (call.function.name === "prepare_reservation") {
        const hotelKey = optionalText(args.hotelKey, 200);
        const entry = [
          ...knownHotelEntries,
          ...(sourcedHotels || []).map((hotel) => ({ hotel, context: sourcedSearchContext })),
        ].find((candidate) => candidate.hotel.hotelKey === hotelKey);
        if (!entry) {
          result = { ready: false, error: "That hotel is not in the verified conversation inventory. Search again before reserving." };
        } else if (!entry.context?.checkIn || !entry.context.checkOut) {
          result = { ready: false, error: "Travel dates are required before this reservation can be prepared.", requestedFields: ["dates"] };
        } else {
          preparedAction = {
            id: `create-${entry.hotel.hotelKey}`,
            label: `Confirm ${entry.hotel.name}`,
            kind: "create_reservation",
            targetId: entry.hotel.hotelKey,
            hotel: entry.hotel,
            searchContext: entry.context,
          };
          result = { ready: true, hotel: entry.hotel.name, checkIn: entry.context.checkIn, checkOut: entry.context.checkOut };
          onStatus("Preparing your reservation confirmation");
        }
      } else if (call.function.name === "prepare_reactivation") {
        const reference = optionalText(args.reference, 40)?.toUpperCase();
        if (!reference) {
          result = { ready: false, error: "A reservation reference is required." };
        } else {
          onStatus("Checking the cancelled reservation");
          const { data, error } = await supabase.from("reservations").select("*").eq("reference", reference).single();
          if (error || !data) {
            result = { ready: false, error: "That reservation was not found for this account." };
          } else {
            const reservation = mapReservation(data);
            if (reservation.status !== "cancelled") {
              result = { ready: false, error: "That reservation is already active." };
            } else {
              preparedAction = {
                id: `reactivate-${reservation.id}`,
                label: `Reactivate ${reservation.reference}`,
                kind: "reactivate_reservation",
                targetId: reservation.id,
                reservation,
              };
              sourcedReservations = [reservation];
              result = { ready: true, reference: reservation.reference, hotel: reservation.hotelName };
              onStatus("Preparing reactivation confirmation");
            }
          }
        }
      } else {
        result = { error: "Unknown tool" };
      }
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
    }
  }
  throw new Error("StayAI reached its tool limit. Try a more specific request.");
}
