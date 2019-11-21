import { WebSocketSubject, WebSocketSubjectConfig } from "rxjs/webSocket";

/**
 * Options that control the streamRequest command
 */
export interface StreamRequestOptions<T = any> {
  /**
   * Time to wait for the stream to complete. Can be changed via defaultCommandTimeout
   * global option for now due to an issue with how Cypress works internaly.
   * Otherwise check workaround using cy.wrap
   *
   * @default defaultCommandTimeout
   */
  streamTimeout: number;
  /**
   * Time to wait between retrying in case connection failed or response does not meet
   * the retryUntilFn check.
   *
   * @default 4000
   */
  retryDelay: number;
  /**
   * Number of times to retry in case connection failed or response does not meet
   * the retryUntilFn check.
   *
   * @default 5
   */
  retryAttempts: number;
  /**
   * Message to send when opening the connection
   * Usual scenario is to send auth data or some other initial payload request
   *
   * @default null
   */
  startUpMessage: any;
  /**
   * Check stream message in order to tell the command to close the stream and return the results
   * By default it will close after first
   *
   */
  takeWhileFn(message: T): boolean;
  /**
   * Check all messages in order to tell the command to if it shoulr return the results or retry
   *
   */
  retryUntilFn(result: T[]): boolean;
}

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Streams data from a websocket.
       *
       * @memberof Cypress.Chainable
       *
       * @example
        ```
        cy.stream<T>(urlConfigOrSource, streamOptions).then((websocket: WebSocketSubject<T>) => {})
        ```
       */
      stream: <T = any>(
        urlConfigOrSource: string | WebSocketSubjectConfig<T>
      ) => Chainable<WebSocketSubject<T>>;
      /**
       * Streams data from a websocket and completes it in a Promise.
       *
       * @memberof Cypress.Chainable
       *
       * @example
        ```
        cy.streamRequest<T>(urlConfigOrSource, streamOptions).then((results: T[]) => {})
        ```
       */
      streamRequest: <T = any>(
        urlConfigOrSource: string | WebSocketSubjectConfig<T>,
        streamOptions: Partial<StreamRequestOptions<T>>
      ) => Chainable<T[] | void>;
    }
  }
}
