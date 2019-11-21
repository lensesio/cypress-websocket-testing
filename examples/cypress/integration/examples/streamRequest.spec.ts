import { StreamRequestOptions } from "@lensesio/cypress-websocket-testing";
import { WebSocketSubjectConfig } from "rxjs/webSocket";

type MessageType = "CONNECTED" | "LOGIN" | "RECORD" | "END";

interface IMessage {
  type: MessageType;
  data: any;
}

// For full set of config values, check rxjs documentation
const config: WebSocketSubjectConfig<IMessage> = {
  url: "ws://localhost:8080/"
};

let options: Partial<StreamRequestOptions<IMessage>>;

context("Websocket cy.streamRequests() Command", () => {
  before(() => {
    // If you don't want to wrap the call, change this setting in order to increase timeout
    // Cypress.config("defaultCommandTimeout", 40000);
  });

  it("Without any options set it will close on first message", () => {
    options = {};
    // Wrap the request in order to bypass the defaultCommandTimeout
    // Investigating alternative solutions
    cy.wrap(null, { timeout: 10000 }).then(() =>
      cy.streamRequest<IMessage>(config, options).then(results => {
        const result = results && results[0];
        expect(result).to.not.be.undefined;
        expect(result).to.have.property("type", "CONNECTED");
        expect(result).to.not.have.property("data");
      })
    );
  });
  it("With startUpMessage and takeWhileFn", () => {
    options = {
      // Finish when the END message is sent
      takeWhileFn: (message: IMessage) => message && message.type !== "END",
      startUpMessage: {
        type: "LOGIN",
        data: "Developer"
      }
    };
    cy.wrap(null, { timeout: 10000 }).then(() =>
      cy.streamRequest<IMessage>(config, options).then(results => {
        const length = (results && results.length) || 0;
        const result = results && results[length - 1];
        expect(length).to.eq(3);
        expect(result).to.not.be.undefined;
        expect(result).to.have.property("type", "END");
        expect(result).to.have.property("data", "Bye, Developer!");
      })
    );
  });
  it("With retryUntilFn set", () => {
    options = {
      // Finish when the END message is sent
      takeWhileFn: (message: IMessage) => message && message.type !== "END",
      streamTimeout: 20000,
      // Retry connection until the data value is greater than 5
      // (they are sent at random values by the server)
      retryUntilFn: (messages: IMessage[]) =>
        messages.filter(message => message.data > 5).length > 0,
      startUpMessage: {
        type: "LOGIN",
        data: "Developer"
      }
    };
    // Wrap the request in order to bypass the defaultCommandTimeout
    // Investigating alternative solutions
    cy.wrap(null, { timeout: options.streamTimeout }).then(() =>
      cy.streamRequest<IMessage>(config, options).then(results => {
        const result = results && results[1];
        const data = result && result.data;
        expect(result).to.not.be.undefined;
        expect(result).to.have.property("type", "RECORD");
        expect(data > 5).to.be.true;
      })
    );
  });
});
