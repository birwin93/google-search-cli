import type { FlightResult } from "./types";

function minutesToHM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function safeDateTime(input: string): string {
  // Preserve provider-local time strings to avoid timezone shifting in CLI output.
  return input;
}

export function normalizeFlights(results: FlightResult[] | undefined, group: string): Array<Record<string, string | number>> {
  if (!results) return [];

  return results.map((flight, index) => {
    const firstLeg = flight.flights[0];
    const lastLeg = flight.flights[flight.flights.length - 1];
    const airlines = [...new Set(flight.flights.map((leg) => leg.airline))].join(", ");
    const duration = flight.total_duration ?? flight.flights.reduce((acc, leg) => acc + leg.duration, 0);

    return {
      group,
      rank: index + 1,
      price: flight.price ?? "N/A",
      duration: minutesToHM(duration),
      stops: Math.max(flight.flights.length - 1, 0),
      depart: safeDateTime(firstLeg.departure_airport.time),
      arrive: safeDateTime(lastLeg.arrival_airport.time),
      route: `${firstLeg.departure_airport.id} -> ${lastLeg.arrival_airport.id}`,
      airlines
    };
  });
}
