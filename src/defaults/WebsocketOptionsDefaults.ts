import { StreamRequestOptions } from "../internal/types";

const WEBSOCKET_OPTIONS_DEFAULTS: StreamRequestOptions = {
  streamTimeout: Cypress.config("defaultCommandTimeout"),
  retryDelay: 4000,
  retryAttempts: 5,
  startUpMessage: null,
  retryUntilFn: (): boolean => true,
  takeWhileFn: (): boolean => false
};

export default WEBSOCKET_OPTIONS_DEFAULTS;
