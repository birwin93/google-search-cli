export type FlightSearchOptions = {
  apiKey?: string;
  from: string;
  to: string;
  date: string;
  returnDate?: string;
  adults: number;
  children: number;
  infantsInSeat: number;
  infantsOnLap: number;
  cabin: "economy" | "premium-economy" | "business" | "first";
  currency: string;
  hl: string;
  gl: string;
  maxPrice?: number;
  includeAirlines?: string[];
  excludeAirlines?: string[];
  stops?: 0 | 1 | 2 | 3;
  deepSearch: boolean;
};

export type AirportPoint = {
  id: string;
  name: string;
  time: string;
};

export type FlightLeg = {
  departure_airport: AirportPoint;
  arrival_airport: AirportPoint;
  duration: number;
  airline: string;
  flight_number?: string;
};

export type FlightResult = {
  price?: number;
  total_duration?: number;
  flights: FlightLeg[];
  departure_token?: string;
};

export type GoogleFlightsResponse = {
  best_flights?: FlightResult[];
  other_flights?: FlightResult[];
  search_metadata?: {
    id?: string;
    status?: string;
    google_flights_url?: string;
    total_time_taken?: number;
  };
  search_parameters?: Record<string, unknown>;
  error?: string;
};
