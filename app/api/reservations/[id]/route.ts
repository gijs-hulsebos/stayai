import { mapReservation } from "@/lib/data-mappers";
import { jsonError, requireAuthenticatedClient } from "@/lib/supabase/server";

export async function GET(request: Request, context: RouteContext<"/api/reservations/[id]">) {
  try {
    const { id } = await context.params;
    const { supabase } = await requireAuthenticatedClient(request);
    const { data, error } = await supabase.from("reservations").select("*").eq("id", id).single();
    if (error) return Response.json({ error: "Reservation not found." }, { status: 404 });
    return Response.json({ reservation: mapReservation(data) });
  } catch (error) { return jsonError(error, "Reservation details could not be loaded."); }
}
