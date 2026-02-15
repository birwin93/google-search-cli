#!/usr/bin/env bun

import { Command } from "commander";
import { buildGoogleFlightsCommand } from "./commands/google-flights";

const program = new Command();

program
  .name("flights-cli")
  .description("Multi-provider flights CLI")
  .version("0.1.0")
  .showHelpAfterError();

program.addCommand(buildGoogleFlightsCommand());

program.parseAsync(process.argv).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
