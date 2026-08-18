import type { ChatTurn } from "@/lib/models";
import { runStayAiAgent } from "@/lib/openrouter";
import { requireAuthenticatedClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let auth: Awaited<ReturnType<typeof requireAuthenticatedClient>>;
  try { auth = await requireAuthenticatedClient(request); }
  catch (error) { return error instanceof Response ? error : Response.json({ error: "Authentication failed" }, { status: 401 }); }

  const body = await request.json().catch(() => null) as { message?: string; history?: ChatTurn[] } | null;
  const message = body?.message?.trim();
  if (!message || message.length > 2_000) return Response.json({ error: "Enter a message under 2,000 characters." }, { status: 400 });
  const history = Array.isArray(body?.history) ? body!.history.slice(-12) : [];
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        emit({ type: "status", label: "Understanding your request" });
        const response = await runStayAiAgent({ message, history, supabase: auth.supabase, onStatus: (label) => emit({ type: "status", label }) });
        emit({ type: "final", response });
      } catch (error) {
        const messageText = error instanceof Error ? error.message : "StayAI could not complete that request.";
        emit({ type: "error", error: messageText });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
}
