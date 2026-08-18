export type RequestedField =
  | "destination"
  | "dates"
  | "guests"
  | "rooms"
  | "budget"
  | "atmosphere"
  | "amenities"
  | "accessibility";

export type AssistantMode =
  | "clarification"
  | "hotel_results"
  | "reservation_confirmation"
  | "reservation_list"
  | "reservation_detail"
  | "bookmarks"
  | "status";

export type HotelRate = {
  providerCode: string | null;
  providerName: string;
  nightlyRate: number;
  totalPrice: number;
  currency: string;
  collectedAt: string;
};

export type HotelResult = {
  hotelKey: string;
  locationKey: string | null;
  name: string;
  url: string | null;
  imageUrl: string | null;
  placeName: string | null;
  accommodationType: string | null;
  rating: number | null;
  reviewCount: number | null;
  reason: string;
  highlights: string[];
  rate: HotelRate | null;
};

export type SearchContext = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  childAges?: number[];
  pets?: number;
  rooms?: number;
  currency?: string;
  budget?: string;
  atmosphere?: string[];
  amenities?: string[];
  accessibility?: string[];
};

export type AssistantAction = {
  id: string;
  label: string;
  kind: "open_reservation" | "open_bookmarks" | "search_again" | "create_reservation" | "reactivate_reservation";
  targetId?: string;
  hotel?: HotelResult;
  searchContext?: SearchContext;
  reservation?: Reservation;
};

export type Reservation = {
  id: string;
  reference: string;
  status: "confirmed" | "cancelled";
  hotelKey: string;
  locationKey: string | null;
  hotelName: string;
  hotelUrl: string | null;
  imageUrl: string | null;
  placeName: string | null;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  childAges: number[];
  pets: number;
  currency: string;
  providerCode: string | null;
  providerName: string | null;
  nightlyRate: number;
  totalPrice: number;
  rateCollectedAt: string;
  hotelSnapshot: HotelResult;
  createdAt: string;
  cancelledAt: string | null;
};

export type Bookmark = {
  id: string;
  hotelKey: string;
  hotel: HotelResult;
  createdAt: string;
};

export type AssistantResponse = {
  reply: string;
  mode: AssistantMode;
  requestedFields: RequestedField[];
  hotels?: HotelResult[];
  reservations?: Reservation[];
  actions?: AssistantAction[];
  searchContext?: SearchContext;
};

export type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  text: string;
  response?: AssistantResponse;
  isError?: boolean;
  failedMessage?: string;
};

export type ActivityStep = {
  id: string;
  label: string;
  state: "active" | "complete";
};
