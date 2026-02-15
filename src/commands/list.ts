import { Command } from "commander";
import { parseCabin, parseFlightSearchOptions, toNonNegativeInt, type RawFlightSearchOptions } from "../lib/options";
import { searchFlights } from "../lib/serpapi";
import type { FlightLeg, FlightResult } from "../lib/types";

type SortBy = "price" | "duration" | "stops";

type RawListOptions = RawFlightSearchOptions & {
  limit: string;
  sortBy: SortBy;
  preferAirline?: string;
  preferNonstop: boolean;
  nonstopOnly: boolean;
  showToken: boolean;
};

type FlightRow = {
  group: string;
  rank: number;
  price: number | "N/A";
  priceSort: number;
  duration: string;
  durationMinutes: number;
  stops: number;
  depart: string;
  arrive: string;
  route: string;
  airlines: string;
  segments: string;
  departureToken?: string;
};

const SORT_CHOICES = new Set<SortBy>(["price", "duration", "stops"]);

function parseSortBy(value: string): SortBy {
  if (!SORT_CHOICES.has(value as SortBy)) {
    throw new Error("sort-by must be one of: price, duration, stops");
  }
  return value as SortBy;
}

function minutesToHM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function serializeSegment(leg: FlightLeg): string {
  const carrier = leg.flight_number ? `${leg.airline} ${leg.flight_number}` : leg.airline;
  return `${carrier} ${leg.departure_airport.id}->${leg.arrival_airport.id}`;
}

function toRow(flight: FlightResult, group: string, rank: number): FlightRow {
  const legs = flight.flights;
  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];
  const durationMinutes = flight.total_duration ?? legs.reduce((acc, leg) => acc + leg.duration, 0);
  const airlines = [...new Set(legs.map((leg) => leg.airline))].join(", ");

  return {
    group,
    rank,
    price: flight.price ?? "N/A",
    priceSort: flight.price ?? Number.MAX_SAFE_INTEGER,
    duration: minutesToHM(durationMinutes),
    durationMinutes,
    stops: Math.max(legs.length - 1, 0),
    depart: firstLeg.departure_airport.time,
    arrive: lastLeg.arrival_airport.time,
    route: `${firstLeg.departure_airport.id} -> ${lastLeg.arrival_airport.id}`,
    airlines,
    segments: legs.map((leg) => serializeSegment(leg)).join(" | "),
    departureToken: flight.departure_token
  };
}

function collectRows(results: FlightResult[] | undefined, group: string): FlightRow[] {
  if (!results) return [];
  return results.map((flight, index) => toRow(flight, group, index + 1));
}

function compareBySort(a: FlightRow, b: FlightRow, sortBy: SortBy): number {
  if (sortBy === "price") {
    return a.priceSort - b.priceSort;
  }

  if (sortBy === "stops") {
    return a.stops - b.stops;
  }

  return a.durationMinutes - b.durationMinutes;
}

function airlinePreferenceMatches(row: FlightRow, preferAirline?: string): boolean {
  if (!preferAirline) return false;
  const needle = preferAirline.toLowerCase().trim();
  const haystack = `${row.airlines} ${row.segments}`.toLowerCase();
  return haystack.includes(needle);
}

function extractCarrierCodes(row: FlightRow): string[] {
  const matches = row.segments.match(/\b([A-Z0-9]{2})\s+\d{1,4}\b/g) ?? [];
  return [...new Set(matches.map((item) => item.split(/\s+/)[0]))];
}

function sortRows(rows: FlightRow[], raw: RawListOptions): FlightRow[] {
  return rows.sort((a, b) => {
    if (raw.preferAirline) {
      const aMatch = airlinePreferenceMatches(a, raw.preferAirline);
      const bMatch = airlinePreferenceMatches(b, raw.preferAirline);
      if (aMatch !== bMatch) {
        return aMatch ? -1 : 1;
      }
    }

    if (raw.preferNonstop) {
      if (a.stops !== b.stops) {
        return a.stops - b.stops;
      }
    }

    const primary = compareBySort(a, b, raw.sortBy);
    if (primary !== 0) {
      return primary;
    }

    if (a.group !== b.group) {
      return a.group.localeCompare(b.group);
    }

    return a.rank - b.rank;
  });
}

function prepareTableRows(rows: FlightRow[], showToken: boolean): Array<Record<string, string | number>> {
  return rows.map((row) => {
    const tableRow: Record<string, string | number> = {
      group: row.group,
      rank: row.rank,
      price: row.price,
      duration: row.duration,
      stops: row.stops,
      depart: row.depart,
      arrive: row.arrive,
      route: row.route,
      airlines: row.airlines,
      segments: row.segments
    };

    if (showToken) {
      tableRow.departure_token = row.departureToken ?? "";
    }

    return tableRow;
  });
}

export function buildListCommand(): Command {
  return new Command("list")
    .description("Search and list flight options in a ranked table (single SerpAPI request)")
    .requiredOption("--from <airport>", "departure airport code, e.g. JFK")
    .requiredOption("--to <airport>", "arrival airport code, e.g. LAX")
    .requiredOption("--date <date>", "outbound date: YYYY-MM-DD or M/D[/YYYY]")
    .option("--return-date <date>", "return date: YYYY-MM-DD or M/D[/YYYY]")
    .option("--adults <count>", "number of adults", "1")
    .option("--children <count>", "number of children", "0")
    .option("--infants-in-seat <count>", "number of infants in seat", "0")
    .option("--infants-on-lap <count>", "number of infants on lap", "0")
    .option("--cabin <type>", "economy|premium-economy|business|first", parseCabin, "economy")
    .option("--currency <code>", "currency code", "USD")
    .option("--hl <lang>", "language", "en")
    .option("--gl <country>", "country", "us")
    .option("--max-price <amount>", "maximum total price")
    .option("--airlines <codes-or-names>", "include airlines (csv), e.g. UA or united,delta")
    .option("--exclude-airlines <codes-or-names>", "exclude airlines (csv)")
    .option("--stops <count>", "0|1|2|3 stops")
    .option("--deep-search", "enable deep search", false)
    .option("--limit <count>", "maximum rows to print", "10")
    .option("--sort-by <field>", "price|duration|stops", parseSortBy, "price")
    .option("--prefer-airline <name-or-code>", "rank matching airline options first")
    .option("--prefer-nonstop", "rank fewer-stop options first before sort-by", false)
    .option("--nonstop-only", "only include nonstop options", false)
    .option("--show-token", "print departure_token column if present", false)
    .option("--api-key <key>", "SerpAPI key (or set SERPAPI_KEY)")
    .action(async (raw: RawListOptions) => {
      const options = parseFlightSearchOptions(raw);
      const data = await searchFlights(options);

      const allRows = [...collectRows(data.best_flights, "best"), ...collectRows(data.other_flights, "other")];
      if (!allRows.length) {
        console.log("No flights found.");
        return;
      }

      let filteredRows = allRows;

      if (options.stops !== undefined) {
        filteredRows = filteredRows.filter((row) => row.stops === options.stops);
      }

      if (options.includeAirlines?.length) {
        const includeSet = new Set(options.includeAirlines);
        filteredRows = filteredRows.filter((row) => {
          const carriers = extractCarrierCodes(row);
          return carriers.length > 0 && carriers.every((code) => includeSet.has(code));
        });
      }

      if (options.excludeAirlines?.length) {
        const excludeSet = new Set(options.excludeAirlines);
        filteredRows = filteredRows.filter((row) => {
          const carriers = extractCarrierCodes(row);
          return carriers.every((code) => !excludeSet.has(code));
        });
      }

      if (raw.nonstopOnly) {
        filteredRows = filteredRows.filter((row) => row.stops === 0);
      }

      if (!filteredRows.length) {
        console.log("No flights matched the selected filters in this single response.");
        return;
      }

      const limit = toNonNegativeInt(raw.limit, "limit") || 10;
      const sortedRows = sortRows(filteredRows, raw).slice(0, limit);

      if (data.search_metadata?.id) {
        console.log(`search_id: ${data.search_metadata.id}`);
      }
      if (data.search_metadata?.google_flights_url) {
        console.log(`google_flights_url: ${data.search_metadata.google_flights_url}`);
      }
      console.log(`results_shown: ${sortedRows.length}/${filteredRows.length}`);
      console.table(prepareTableRows(sortedRows, raw.showToken));

      if (options.returnDate) {
        console.log("note: round-trip first response mostly lists outbound options; use departure_token for return-leg follow-up queries.");
      }
    });
}
