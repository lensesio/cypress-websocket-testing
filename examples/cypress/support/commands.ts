// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { addStreamCommands } from "@lensesio/cypress-websocket-testing";

// Add cypress websocket commands
addStreamCommands();
// Could also import the command and add it yourself
// Cypress.Commands.add(streamRequestCommand.name, streamRequestCommand.command);
