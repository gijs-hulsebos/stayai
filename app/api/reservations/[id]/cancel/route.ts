import { mapReservation } from "@/lib/data-mappers";
import { jsonError, requireAuthenticatedClient } from "@/lib/supabase/server";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { supabase } = await requireAuthenticatedClient(request);
    const { data, error } = await supabase.from("reservations")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", id).eq("status", "confirmed").select("*").single();
    if (error) return Response.json({ error: "This reservation could not be cancelled." }, { status: 409 });
    return Response.json({ reservation: mapReservation(data) });
  } catch (error) { return jsonError(error, "The reservation could not be cancelled."); }
}
