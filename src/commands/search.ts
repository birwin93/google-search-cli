import { Command } from "commander";
import { parseCabin, parseFlightSearchOptions, type RawFlightSearchOptions } from "../lib/options";
import { searchFlights } from "../lib/serpapi";

export function buildSearchCommand(): Command {
  return new Command("search")
    .description("Search Google Flights and print raw JSON (single SerpAPI request)")
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
    .option("--api-key <key>", "SerpAPI key (or set SERPAPI_KEY)")
    .action(async (raw: RawFlightSearchOptions) => {
      const options = parseFlightSearchOptions(raw);
      const data = await searchFlights(options);
      console.log(JSON.stringify(data, null, 2));
    });
}
