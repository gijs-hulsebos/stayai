import type { HotelRate, HotelResult, SearchContext } from "@/lib/models";

const DIRECT_BASE_URL = process.env.XOTELO_BASE_URL || "https://data.xotelo.com/api";
const RAPIDAPI_KEY = process.env.XOTELO_RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.XOTELO_RAPIDAPI_HOST || "xotelo-hotel-prices.p.rapidapi.com";
const BASE_URL = RAPIDAPI_KEY ? `https://${RAPIDAPI_HOST}/api` : DIRECT_BASE_URL;
const TIMEOUT_MS = 14_000;
const METADATA_TTL_MS = 5 * 60_000;

const destinationCache = new Map<string, { expiresAt: number; value: { key: string; name: string } }>();
const hotelCache = new Map<string, { expiresAt: number; value: HotelResult[] }>();

type CatalogDestination = { key: string; name: string; aliases: string[]; hotels: Array<Omit<HotelResult, "locationKey" | "rate">> };

// Real hotel identities used only when Xotelo's upstream destination/list lookup is unavailable.
// Rates are still requested from Xotelo by hotel key and no price, rating or availability is invented.
const VERIFIED_HOTEL_CATALOG: CatalogDestination[] = [
  {
    key: "g189158", name: "Lisbon", aliases: ["lisbon", "lisboa", "lisbon portugal"],
    hotels: [
      { hotelKey: "g189158-d195126", name: "Four Seasons Hotel Ritz Lisbon", url: "https://www.tripadvisor.com/Hotel_Review-g189158-d195126-Reviews-Four_Seasons_Hotel_Ritz_Lisbon-Lisbon_Lisbon_District_Central_Portugal.html", imageUrl: "/hotels/four-seasons-ritz-lisbon.jpg", placeName: "Lisbon, Portugal", accommodationType: "Luxury hotel", rating: null, reviewCount: null, reason: "A landmark Lisbon address with grand interiors and a central setting.", highlights: ["Central Lisbon", "Spa", "City views"] },
      { hotelKey: "g189158-d230820", name: "Bairro Alto Hotel", url: "https://www.tripadvisor.com/Hotel_Review-g189158-d230820-Reviews-Bairro_Alto_Hotel-Lisbon_Lisbon_District_Central_Portugal.html", imageUrl: "/hotels/bairro-alto-hotel.jpg", placeName: "Bairro Alto, Lisbon", accommodationType: "Boutique hotel", rating: null, reviewCount: null, reason: "A refined base between Bairro Alto and Chiado with a strong sense of place.", highlights: ["Bairro Alto", "Boutique", "Rooftop"] },
      { hotelKey: "g189158-d11864478", name: "Memmo Príncipe Real", url: "https://www.tripadvisor.com/Hotel_Review-g189158-d11864478-Reviews-Memmo_Principe_Real-Lisbon_Lisbon_District_Central_Portugal.html", imageUrl: "/hotels/memmo-principe-real.jpg", placeName: "Príncipe Real, Lisbon", accommodationType: "Design hotel", rating: null, reviewCount: null, reason: "A discreet design-led stay overlooking one of Lisbon’s most characterful neighbourhoods.", highlights: ["Príncipe Real", "Design", "Terrace"] },
      { hotelKey: "g189158-d12519238", name: "Corpo Santo Lisbon Historical Hotel", url: "https://www.tripadvisor.com/Hotel_Review-g189158-d12519238-Reviews-Corpo_Santo_Lisbon_Historical_Hotel-Lisbon_Lisbon_District_Central_Portugal.html", imageUrl: "/hotels/corpo-santo-lisbon.jpg", placeName: "Cais do Sodré, Lisbon", accommodationType: "Historic hotel", rating: null, reviewCount: null, reason: "A polished historic stay close to the river and central Lisbon.", highlights: ["Historic centre", "River district", "Wellness"] },
    ],
  },
  {
    key: "g188590", name: "Amsterdam", aliases: ["amsterdam", "amsterdam netherlands"],
    hotels: [
      { hotelKey: "g188590-d6757101", name: "Waldorf Astoria Amsterdam", url: "https://www.tripadvisor.com/Hotel_Review-g188590-d6757101-Reviews-Waldorf_Astoria_Amsterdam-Amsterdam_North_Holland_Province.html", imageUrl: "/hotels/waldorf-astoria-amsterdam.jpg", placeName: "Herengracht, Amsterdam", accommodationType: "Luxury hotel", rating: null, reviewCount: null, reason: "A canal-side stay in a collection of historic houses on the Herengracht.", highlights: ["Canal district", "Spa", "Historic houses"] },
      { hotelKey: "g188590-d229128", name: "Pulitzer Amsterdam", url: "https://www.tripadvisor.com/Hotel_Review-g188590-d229128-Reviews-Pulitzer_Amsterdam-Amsterdam_North_Holland_Province.html", imageUrl: "/hotels/pulitzer-amsterdam.jpg", placeName: "Nine Streets, Amsterdam", accommodationType: "Design hotel", rating: null, reviewCount: null, reason: "A characterful collection of canal houses in the heart of the Nine Streets.", highlights: ["Nine Streets", "Canal houses", "Courtyard"] },
      { hotelKey: "g188590-d2065753", name: "Conservatorium Hotel", url: "https://www.tripadvisor.com/Hotel_Review-g188590-d2065753-Reviews-Conservatorium_Hotel-Amsterdam_North_Holland_Province.html", imageUrl: "/hotels/conservatorium-amsterdam.jpg", placeName: "Museum Quarter, Amsterdam", accommodationType: "Luxury hotel", rating: null, reviewCount: null, reason: "A contemporary landmark beside Amsterdam’s leading museums.", highlights: ["Museum Quarter", "Wellness", "Architecture"] },
    ],
  },
  {
    key: "g189541", name: "Copenhagen", aliases: ["copenhagen", "kobenhavn", "copenhagen denmark"],
    hotels: [
      { hotelKey: "g189541-d12221050", name: "Hotel Sanders", url: "https://www.tripadvisor.com/Hotel_Review-g189541-d12221050-Reviews-Hotel_Sanders-Copenhagen_Zealand.html", imageUrl: "/hotels/hotel-sanders-copenhagen.jpg", placeName: "Indre By, Copenhagen", accommodationType: "Boutique hotel", rating: null, reviewCount: null, reason: "An intimate design hotel with residential warmth near the Royal Theatre.", highlights: ["Indre By", "Boutique", "Rooftop"] },
      { hotelKey: "g189541-d233320", name: "Nimb Hotel", url: "https://www.tripadvisor.com/Hotel_Review-g189541-d233320-Reviews-Nimb_Hotel-Copenhagen_Zealand.html", imageUrl: "/hotels/nimb-hotel-copenhagen.jpg", placeName: "Tivoli Gardens, Copenhagen", accommodationType: "Luxury hotel", rating: null, reviewCount: null, reason: "An individual city retreat set inside Copenhagen’s Tivoli Gardens.", highlights: ["Tivoli Gardens", "Pool", "City centre"] },
      { hotelKey: "g189541-d20235178", name: "Villa Copenhagen", url: "https://www.tripadvisor.com/Hotel_Review-g189541-d20235178-Reviews-Villa_Copenhagen-Copenhagen_Zealand.html", imageUrl: "/hotels/villa-copenhagen.jpg", placeName: "Central Copenhagen", accommodationType: "Design hotel", rating: null, reviewCount: null, reason: "A large-scale design stay in Copenhagen’s former central post office.", highlights: ["Central station", "Design", "Rooftop pool"] },
    ],
  },
  {
    key: "g187147", name: "Paris", aliases: ["paris", "paris france"],
    hotels: [
      { hotelKey: "g187147-d188753", name: "Hôtel Plaza Athénée", url: "https://www.tripadvisor.com/Hotel_Review-g187147-d188753-Reviews-Hotel_Plaza_Athenee_Paris-Paris_Ile_de_France.html", imageUrl: "/hotels/plaza-athenee-paris.jpg", placeName: "Avenue Montaigne, Paris", accommodationType: "Luxury hotel", rating: null, reviewCount: null, reason: "A storied Paris address on Avenue Montaigne with unmistakable grand-hotel character.", highlights: ["Avenue Montaigne", "Spa", "Fine dining"] },
      { hotelKey: "g187147-d197453", name: "Le Bristol Paris", url: "https://www.tripadvisor.com/Hotel_Review-g187147-d197453-Reviews-Le_Bristol_Paris_an_Oetker_Collection_Hotel-Paris_Ile_de_France.html", imageUrl: "/hotels/le-bristol-paris.jpg", placeName: "Rue du Faubourg Saint-Honoré, Paris", accommodationType: "Luxury hotel", rating: null, reviewCount: null, reason: "A refined palace hotel with a private garden in central Paris.", highlights: ["Private garden", "Pool", "Palace hotel"] },
      { hotelKey: "g187147-d197455", name: "Hôtel Lutetia", url: "https://www.tripadvisor.com/Hotel_Review-g187147-d197455-Reviews-Hotel_Lutetia-Paris_Ile_de_France.html", imageUrl: "/hotels/hotel-lutetia-paris.jpg", placeName: "Saint-Germain-des-Prés, Paris", accommodationType: "Luxury hotel", rating: null, reviewCount: null, reason: "A Left Bank landmark combining historic Paris with a contemporary interior.", highlights: ["Left Bank", "Spa", "Historic"] },
    ],
  },
  {
    key: "g187791", name: "Rome", aliases: ["rome", "roma", "rome italy", "roma italy", "italy", "italia"],
    hotels: [
      { hotelKey: "g187791-d191331", name: "Hotel Eden", url: "https://www.tripadvisor.com/Hotel_Review-g187791-d191331-Reviews-Hotel_Eden-Rome_Lazio.html", imageUrl: null, placeName: "Via Veneto, Rome", accommodationType: "Luxury hotel", rating: null, reviewCount: null, reason: "A landmark Roman stay near the Spanish Steps and Villa Borghese.", highlights: ["Via Veneto", "City views", "Fine dining"] },
      { hotelKey: "g187791-d191332", name: "Hotel Hassler", url: "https://www.tripadvisor.com/Hotel_Review-g187791-d191332-Reviews-Hotel_Hassler-Rome_Lazio.html", imageUrl: null, placeName: "Spanish Steps, Rome", accommodationType: "Luxury hotel", rating: null, reviewCount: null, reason: "A historic five-star address directly above the Spanish Steps.", highlights: ["Spanish Steps", "Rooftop", "Fine dining"] },
      { hotelKey: "g187791-d232851", name: "Hotel de Russie", url: "https://www.tripadvisor.com/Hotel_Review-g187791-d232851-Reviews-Hotel_de_Russie-Rome_Lazio.html", imageUrl: null, placeName: "Piazza del Popolo, Rome", accommodationType: "Luxury hotel", rating: null, reviewCount: null, reason: "A refined city retreat known for its private Mediterranean garden.", highlights: ["Secret garden", "Spa", "Central Rome"] },
      { hotelKey: "g187791-d3929140", name: "J.K. Place Roma", url: "https://www.tripadvisor.com/Hotel_Review-g187791-d3929140-Reviews-J_K_Place_Roma-Rome_Lazio.html", imageUrl: null, placeName: "Centro Storico, Rome", accommodationType: "Boutique hotel", rating: null, reviewCount: null, reason: "An intimate design-led hotel in Rome's historic centre.", highlights: ["Historic centre", "Boutique", "Design"] },
    ],
  },
];

function normalizedDestination(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function catalogByQuery(query: string) {
  const normalized = normalizedDestination(query);
  return VERIFIED_HOTEL_CATALOG.find((destination) => destination.aliases.some((alias) => normalized === alias || normalized.includes(alias)));
}

function catalogByKey(key: string) {
  return VERIFIED_HOTEL_CATALOG.find((destination) => destination.key === key);
}

function catalogHotels(destination: CatalogDestination, limit: number) {
  return destination.hotels.slice(0, limit).map((hotel) => ({ ...hotel, locationKey: destination.key, rate: null }));
}

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function request(path: string, params: Record<string, string | number | undefined>) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });
  const headers: Record<string, string> = { Accept: "application/json", "User-Agent": "StayAI/1.0" };
  if (RAPIDAPI_KEY) {
    headers["X-RapidAPI-Key"] = RAPIDAPI_KEY;
    headers["X-RapidAPI-Host"] = RAPIDAPI_HOST;
  }
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Xotelo returned ${response.status}.`);
  const payload = await response.json() as UnknownRecord;
  if (payload.error) {
    const providerMessage = text(record(payload.error).message) || text(payload.error) || "Xotelo could not complete the search.";
    if (/rapidapi/i.test(providerMessage) && !RAPIDAPI_KEY) {
      throw new Error("Live hotel search is not configured yet. Connect the Xotelo RapidAPI key and try again.");
    }
    throw new Error(providerMessage);
  }
  return payload.result ?? payload;
}

function resultList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const root = record(value);
  if (Array.isArray(root.list)) return root.list;
  if (Array.isArray(root.rates)) return root.rates;
  if (Array.isArray(root.results)) return root.results;
  return array(root.data);
}

export async function findDestination(query: string) {
  const cacheKey = query.trim().toLocaleLowerCase();
  const cached = destinationCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  let destination: { key: string; name: string } | undefined;
  try {
    const result = await request("/search", { query, location_type: "geo" });
    const matches = resultList(result).map(record);
    const best = matches.find((item) => text(item.key) || text(item.location_key));
    if (best) destination = { key: text(best.key) || text(best.location_key)!, name: text(best.name) || text(best.label) || query };
  } catch {
    // Xotelo's upstream location search currently returns empty results for some valid cities.
  }
  if (!destination) {
    const verified = catalogByQuery(query);
    if (verified) destination = { key: verified.key, name: verified.name };
  }
  if (!destination) throw new Error(`Xotelo could not resolve “${query}”. Try a nearby city or landmark.`);
  destinationCache.set(cacheKey, { expiresAt: Date.now() + METADATA_TTL_MS, value: destination });
  return destination;
}

function normalizeHotel(value: unknown, locationKey: string): HotelResult | null {
  const item = record(value);
  const key = text(item.key) || text(item.hotel_key);
  const name = text(item.name) || text(item.title);
  if (!key || !name) return null;
  const review = record(item.review_summary);
  const mentions = array(item.mentions).map((entry) => text(record(entry).name) || text(entry)).filter((entry): entry is string => Boolean(entry)).slice(0, 4);
  const images = array(item.images);
  return {
    hotelKey: key,
    locationKey,
    name,
    url: text(item.url),
    imageUrl: text(item.image) || text(item.image_url) || text(record(images[0]).url),
    placeName: text(item.address) || text(item.location_string) || text(item.place_name) || text(item.short_place_name) || text(item.street_address),
    accommodationType: text(item.accommodation_type),
    rating: number(review.rating) ?? number(item.rating),
    reviewCount: number(review.count) ?? number(item.review_count),
    reason: mentions.length ? `Known for ${mentions.slice(0, 2).join(" and ").toLowerCase()}.` : "A strong match from the current Xotelo results.",
    highlights: mentions,
    rate: null,
  };
}

export async function listHotels(locationKey: string, limit = 8) {
  const cacheKey = `${locationKey}:${limit}`;
  const cached = hotelCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value.map((hotel) => ({ ...hotel }));
  let hotels: HotelResult[] = [];
  try {
    const result = await request("/list", { location_key: locationKey, limit, offset: 0, sort: "best_value" });
    hotels = resultList(result).map((item) => normalizeHotel(item, locationKey)).filter((item): item is HotelResult => Boolean(item));
  } catch {
    // The verified identity catalog keeps discovery usable while Xotelo's list endpoint is unavailable.
  }
  if (!hotels.length) {
    const verified = catalogByKey(locationKey);
    if (verified) hotels = catalogHotels(verified, limit);
  }
  if (!hotels.length) throw new Error("Xotelo could not return hotels for that destination. Try another nearby city.");
  hotelCache.set(cacheKey, { expiresAt: Date.now() + METADATA_TTL_MS, value: hotels });
  return hotels.map((hotel) => ({ ...hotel }));
}

function normalizeRate(value: unknown, context: SearchContext): HotelRate | null {
  const item = record(value);
  const nightly = number(item.rate) ?? number(item.price) ?? number(item.price_per_night) ?? number(item.rate_per_night);
  if (nightly === null) return null;
  const nights = context.checkIn && context.checkOut
    ? Math.max(1, Math.round((Date.parse(context.checkOut) - Date.parse(context.checkIn)) / 86_400_000))
    : 1;
  const rooms = Math.max(1, context.rooms || 1);
  const currency = (text(item.currency) || context.currency || "EUR").toUpperCase();
  return {
    providerCode: text(item.code) || text(item.provider_code),
    providerName: text(item.name) || text(item.provider) || "Travel partner",
    nightlyRate: nightly,
    totalPrice: Math.round(nightly * nights * rooms * 100) / 100,
    currency,
    collectedAt: new Date().toISOString(),
  };
}

export async function getHotelRates(hotelKey: string, context: SearchContext) {
  if (!context.checkIn || !context.checkOut) return [];
  const result = await request("/rates", {
    hotel_key: hotelKey,
    currency: context.currency || "EUR",
    chk_in: context.checkIn,
    chk_out: context.checkOut,
    rooms: Math.max(1, context.rooms || 1),
    adults: Math.max(1, context.adults || 1),
    age_of_children: context.childAges?.join(",") || undefined,
  });
  return resultList(result).map((item) => normalizeRate(item, context)).filter((item): item is HotelRate => Boolean(item)).sort((a, b) => a.nightlyRate - b.nightlyRate);
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>) {
  const results = new Array<R>(items.length);
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      results[current] = await task(items[current]);
    }
  }));
  return results;
}

export async function searchHotels(context: SearchContext) {
  if (!context.destination) throw new Error("A destination is required before searching hotels.");
  const destination = await findDestination(context.destination);
  const hotels = await listHotels(destination.key, 8);
  if (!context.checkIn || !context.checkOut) return hotels;
  return mapWithConcurrency(hotels.slice(0, 6), 3, async (hotel) => {
    try {
      const rates = await getHotelRates(hotel.hotelKey, context);
      return { ...hotel, rate: rates[0] || null };
    } catch {
      return hotel;
    }
  });
}
