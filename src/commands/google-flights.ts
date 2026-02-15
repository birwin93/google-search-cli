import { Command } from "commander";
import { buildListCommand } from "./list";
import { buildSearchCommand } from "./search";

export function buildGoogleFlightsCommand(): Command {
  const command = new Command("google-flights")
    .description("Google Flights tools (via SerpAPI)");

  command.addCommand(buildSearchCommand());
  command.addCommand(buildListCommand());

  return command;
}
