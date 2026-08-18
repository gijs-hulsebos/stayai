import type { Database } from "@/lib/database.types";
import type { Bookmark, HotelResult, Reservation } from "@/lib/models";

type ReservationRow = Database["public"]["Tables"]["reservations"]["Row"];
type BookmarkRow = Database["public"]["Tables"]["bookmarks"]["Row"];

export function mapReservation(row: ReservationRow): Reservation {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status === "cancelled" ? "cancelled" : "confirmed",
    hotelKey: row.hotel_key,
    locationKey: row.location_key,
    hotelName: row.hotel_name,
    hotelUrl: row.hotel_url,
    imageUrl: row.image_url,
    placeName: row.place_name,
    checkIn: row.check_in,
    checkOut: row.check_out,
    rooms: row.rooms,
    adults: row.adults,
    childAges: row.child_ages,
    pets: row.pets,
    currency: row.currency,
    providerCode: row.provider_code,
    providerName: row.provider_name,
    nightlyRate: Number(row.nightly_rate),
    totalPrice: Number(row.total_price),
    rateCollectedAt: row.rate_collected_at,
    hotelSnapshot: row.hotel_snapshot as unknown as HotelResult,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at,
  };
}

export function mapBookmark(row: BookmarkRow): Bookmark {
  return {
    id: row.id,
    hotelKey: row.hotel_key,
    hotel: row.hotel_snapshot as unknown as HotelResult,
    createdAt: row.created_at,
  };
}

export function createReservationReference() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `IO-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
}
