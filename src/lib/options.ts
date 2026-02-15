import type { FlightSearchOptions } from "./types";

export type RawFlightSearchOptions = {
  apiKey?: string;
  from: string;
  to: string;
  date: string;
  returnDate?: string;
  adults: string;
  children: string;
  infantsInSeat: string;
  infantsOnLap: string;
  cabin: FlightSearchOptions["cabin"];
  currency: string;
  hl: string;
  gl: string;
  maxPrice?: string;
  airlines?: string;
  excludeAirlines?: string;
  stops?: string;
  deepSearch: boolean;
};

const CABIN_CHOICES = new Set<FlightSearchOptions["cabin"]>([
  "economy",
  "premium-economy",
  "business",
  "first"
]);

const STOP_CHOICES = new Set([0, 1, 2, 3]);

const AIRLINE_NAME_TO_CODE: Record<string, string> = {
  united: "UA",
  delta: "DL",
  american: "AA",
  southwest: "WN",
  alaska: "AS",
  jetblue: "B6",
  frontier: "F9",
  spirit: "NK",
  hawaiian: "HA"
};

/** Parse flexible date input (YYYY-MM-DD or M/D[/YYYY]) into YYYY-MM-DD. */
export function parseDateInput(value: string, field: string): string {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const mdMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!mdMatch) {
    throw new Error(`${field} must be YYYY-MM-DD or M/D[/YYYY]`);
  }

  const month = Number(mdMatch[1]);
  const day = Number(mdMatch[2]);
  const yearFromInput = mdMatch[3] ? Number(mdMatch[3]) : undefined;

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`${field}: invalid month`);
  }

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error(`${field}: invalid day`);
  }

  const now = new Date();
  const currentYear = now.getFullYear();

  let year = yearFromInput ?? currentYear;
  if (yearFromInput !== undefined && yearFromInput < 100) {
    year += 2000;
  }

  let candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    throw new Error(`${field}: invalid date`);
  }

  // If year is omitted and date has already passed this year, assume next year.
  if (!yearFromInput) {
    const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    if (candidate < todayUTC) {
      candidate = new Date(Date.UTC(currentYear + 1, month - 1, day));
    }
  }

  return candidate.toISOString().slice(0, 10);
}

export function toNonNegativeInt(value: string, name: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return parsed;
}

export function parseCabin(value: string): FlightSearchOptions["cabin"] {
  if (!CABIN_CHOICES.has(value as FlightSearchOptions["cabin"])) {
    throw new Error("cabin must be one of: economy, premium-economy, business, first");
  }
  return value as FlightSearchOptions["cabin"];
}

function normalizeAirlineCode(input: string): string {
  const token = input.trim();
  if (!token) {
    throw new Error("airline value cannot be empty");
  }

  if (/^[A-Za-z0-9]{2}$/.test(token)) {
    return token.toUpperCase();
  }

  const mapped = AIRLINE_NAME_TO_CODE[token.toLowerCase()];
  if (mapped) {
    return mapped;
  }

  throw new Error(`Unknown airline '${token}'. Use 2-letter code (e.g. UA) or common name.`);
}

export function parseAirlineList(value: string | undefined): string[] | undefined {
  if (!value) return undefined;

  const parsed = [...new Set(value.split(",").map((item) => normalizeAirlineCode(item)))];
  return parsed.length ? parsed : undefined;
}

export function parseStops(value: string | undefined): FlightSearchOptions["stops"] {
  if (!value) return undefined;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || !STOP_CHOICES.has(parsed)) {
    throw new Error("stops must be one of: 0, 1, 2, 3");
  }

  return parsed as FlightSearchOptions["stops"];
}

/** Parse shared CLI options into the normalized provider request object. */
export function parseFlightSearchOptions(raw: RawFlightSearchOptions): FlightSearchOptions {
  return {
    apiKey: raw.apiKey,
    from: raw.from.toUpperCase(),
    to: raw.to.toUpperCase(),
    date: parseDateInput(raw.date, "date"),
    returnDate: raw.returnDate ? parseDateInput(raw.returnDate, "return-date") : undefined,
    adults: toNonNegativeInt(raw.adults, "adults"),
    children: toNonNegativeInt(raw.children, "children"),
    infantsInSeat: toNonNegativeInt(raw.infantsInSeat, "infants-in-seat"),
    infantsOnLap: toNonNegativeInt(raw.infantsOnLap, "infants-on-lap"),
    cabin: raw.cabin,
    currency: raw.currency,
    hl: raw.hl,
    gl: raw.gl,
    maxPrice: raw.maxPrice ? toNonNegativeInt(raw.maxPrice, "max-price") : undefined,
    includeAirlines: parseAirlineList(raw.airlines),
    excludeAirlines: parseAirlineList(raw.excludeAirlines),
    stops: parseStops(raw.stops),
    deepSearch: raw.deepSearch
  };
}

export function parseDateForCli(value: string): string {
  return parseDateInput(value, "date");
}
