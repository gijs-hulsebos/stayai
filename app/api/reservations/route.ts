import type { HotelRate, HotelResult, SearchContext } from "@/lib/models";
import { createReservationReference, mapReservation } from "@/lib/data-mappers";
import { jsonError, requireAuthenticatedClient } from "@/lib/supabase/server";
import { getHotelRates } from "@/lib/xotelo";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAuthenticatedClient(request);
    const { data, error } = await supabase.from("reservations").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return Response.json({ reservations: (data || []).map(mapReservation) });
  } catch (error) { return jsonError(error, "Reservations could not be loaded."); }
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await requireAuthenticatedClient(request);
    const body = await request.json() as { hotel?: HotelResult; context?: SearchContext };
    const hotel = body.hotel;
    const context = body.context || {};
    if (!hotel?.hotelKey || !hotel.name || !context.checkIn || !context.checkOut) {
      return Response.json({ error: "Hotel, check-in, and check-out are required." }, { status: 400 });
    }
    if (Date.parse(context.checkOut) <= Date.parse(context.checkIn)) return Response.json({ error: "Check-out must be after check-in." }, { status: 400 });
    let rates: HotelRate[] = [];
    try {
      rates = await getHotelRates(hotel.hotelKey, context);
    } catch {
      // Demo reservations remain available without claiming a live price or availability.
    }
    const rate = (hotel.rate?.providerCode
      ? rates.find((item) => item.providerCode === hotel.rate?.providerCode) || rates[0]
      : rates[0]) || {
      providerCode: null,
      providerName: "Rate on request",
      nightlyRate: 0,
      totalPrice: 0,
      currency: (context.currency || "EUR").toUpperCase(),
      collectedAt: new Date().toISOString(),
    };
    const insert = {
      user_id: user.id,
      reference: createReservationReference(),
      status: "confirmed",
      hotel_key: hotel.hotelKey,
      location_key: hotel.locationKey,
      hotel_name: hotel.name,
      hotel_url: hotel.url,
      image_url: hotel.imageUrl,
      place_name: hotel.placeName,
      check_in: context.checkIn,
      check_out: context.checkOut,
      rooms: Math.max(1, context.rooms || 1),
      adults: Math.max(1, context.adults || 1),
      child_ages: context.childAges || [],
      pets: Math.max(0, context.pets || 0),
      currency: rate.currency,
      provider_code: rate.providerCode,
      provider_name: rate.providerName,
      nightly_rate: rate.nightlyRate,
      total_price: rate.totalPrice,
      rate_collected_at: rate.collectedAt,
      hotel_snapshot: { ...hotel, rate },
    };
    const { data, error } = await supabase.from("reservations").insert(insert).select("*").single();
    if (error) throw error;
    return Response.json({ reservation: mapReservation(data) }, { status: 201 });
  } catch (error) { return jsonError(error, "The demo reservation could not be created."); }
}
