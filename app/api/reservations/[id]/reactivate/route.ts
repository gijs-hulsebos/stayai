import { mapReservation } from "@/lib/data-mappers";
import { jsonError, requireAuthenticatedClient } from "@/lib/supabase/server";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { supabase } = await requireAuthenticatedClient(request);
    const { data, error } = await supabase.from("reservations")
      .update({ status: "confirmed", cancelled_at: null })
      .eq("id", id).eq("status", "cancelled").select("*").single();
    if (error || !data) return Response.json({ error: "This reservation could not be reactivated." }, { status: 409 });
    return Response.json({ reservation: mapReservation(data) });
  } catch (error) { return jsonError(error, "The reservation could not be reactivated."); }
}
