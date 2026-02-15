import { GoogleFlightsResponse, type FlightSearchOptions } from "./types";

const SERP_API_URL = "https://serpapi.com/search.json";

const CABIN_MAP: Record<FlightSearchOptions["cabin"], string> = {
  economy: "1",
  "premium-economy": "2",
  business: "3",
  first: "4"
};

function assertDate(date: string, field: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`${field} must be in YYYY-MM-DD format`);
  }
}

function resolveApiKey(apiKey?: string): string {
  const key = apiKey ?? process.env.SERPAPI_KEY;
  if (!key) {
    throw new Error("Missing SerpAPI key. Use --api-key or set SERPAPI_KEY.");
  }
  return key;
}

export async function searchFlights(options: FlightSearchOptions): Promise<GoogleFlightsResponse> {
  assertDate(options.date, "date");
  if (options.returnDate) {
    assertDate(options.returnDate, "return-date");
  }

  const apiKey = resolveApiKey(options.apiKey);
  const params = new URLSearchParams({
    engine: "google_flights",
    api_key: apiKey,
    departure_id: options.from,
    arrival_id: options.to,
    outbound_date: options.date,
    type: options.returnDate ? "1" : "2",
    travel_class: CABIN_MAP[options.cabin],
    adults: String(options.adults),
    children: String(options.children),
    infants_in_seat: String(options.infantsInSeat),
    infants_on_lap: String(options.infantsOnLap),
    currency: options.currency,
    hl: options.hl,
    gl: options.gl,
    deep_search: options.deepSearch ? "true" : "false"
  });

  if (options.returnDate) {
    params.set("return_date", options.returnDate);
  }

  if (options.maxPrice !== undefined) {
    params.set("max_price", String(options.maxPrice));
  }

  if (options.includeAirlines?.length) {
    params.set("include_airlines", options.includeAirlines.join(","));
  }

  if (options.excludeAirlines?.length) {
    params.set("exclude_airlines", options.excludeAirlines.join(","));
  }

  if (options.stops !== undefined) {
    params.set("stops", String(options.stops));
  }

  const url = `${SERP_API_URL}?${params.toString()}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });

  if (!response.ok) {
    throw new Error(`SerpAPI request failed (${response.status} ${response.statusText})`);
  }

  const data = (await response.json()) as GoogleFlightsResponse;
  if (data.error) {
    throw new Error(`SerpAPI error: ${data.error}`);
  }

  return data;
}
