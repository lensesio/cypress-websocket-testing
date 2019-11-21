
import { timer } from "rxjs";
import { takeUntil, reduce } from "rxjs/operators";
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

context("Websocket cy.stream() Command", () => {
  it("Simple subscribe with close callback to complete", done => {
    // Wrap the request in order to bypass the defaultCommandTimeout
    // Investigating alternative solutions
    cy.stream<IMessage>(config).then(subject => {
      subject
        .pipe(
          // Conflicts due to old rxjs typings being included with cypress
          // In real scenarios, extend this command in support/commands and add your custom logic
          // @ts-ignore
          takeUntil(timer(1000)),
          reduce((acc: IMessage[], val: IMessage) => acc.concat([val]), [])
        )
        .subscribe({
          next: (results: IMessage[]) => {
            const length = (results && results.length) || 0;
            const result = results && results[length - 1];
            expect(length).to.eq(1);
            expect(result).to.not.be.undefined;
            expect(result).to.have.property("type", "CONNECTED");
            expect(result).to.not.have.property("data");
          },
          error: (err: any) => {},
          complete: done
        });
    });
  });
});
