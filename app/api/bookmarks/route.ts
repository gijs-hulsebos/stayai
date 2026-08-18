import type { HotelResult } from "@/lib/models";
import { mapBookmark } from "@/lib/data-mappers";
import { jsonError, requireAuthenticatedClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAuthenticatedClient(request);
    const { data, error } = await supabase.from("bookmarks").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return Response.json({ bookmarks: (data || []).map(mapBookmark) });
  } catch (error) { return jsonError(error, "Saved stays could not be loaded."); }
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await requireAuthenticatedClient(request);
    const body = await request.json() as { hotel?: HotelResult };
    if (!body.hotel?.hotelKey || !body.hotel.name) return Response.json({ error: "A valid hotel is required." }, { status: 400 });
    const { data: existing, error: readError } = await supabase.from("bookmarks")
      .select("*").eq("hotel_key", body.hotel.hotelKey).maybeSingle();
    if (readError) throw readError;
    if (existing) return Response.json({ bookmark: mapBookmark(existing) });
    const { data, error } = await supabase.from("bookmarks").insert({
      user_id: user.id,
      hotel_key: body.hotel.hotelKey,
      hotel_snapshot: body.hotel,
    }).select("*").single();
    if (error) throw error;
    return Response.json({ bookmark: mapBookmark(data) }, { status: 201 });
  } catch (error) { return jsonError(error, "The stay could not be saved."); }
}

export async function DELETE(request: Request) {
  try {
    const { supabase } = await requireAuthenticatedClient(request);
    const body = await request.json() as { hotelKey?: string };
    if (!body.hotelKey) return Response.json({ error: "A hotel key is required." }, { status: 400 });
    const { error } = await supabase.from("bookmarks").delete().eq("hotel_key", body.hotelKey);
    if (error) throw error;
    return new Response(null, { status: 204 });
  } catch (error) { return jsonError(error, "The stay could not be removed."); }
}
