# cypress-websocket-testing

Test your WebSocket endpoints using [Cypress](https://docs.cypress.io/).

[![Build Status](https://travis-ci.com/lensesio/cypress-websocket-testing.svg?branch=master)](https://travis-ci.com/Lensesio/cypress-websocket-testing)
<br />
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![License: Apache 2](https://img.shields.io/badge/license-Apache-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://badges.frapsoft.com/typescript/love/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)


## Table of Contents

- [Background](#Background)
- [Installation](#Installation)
- [Usage](#Usage)
  - [JavaScript](#JavaScript)
  - [TypeScript](#TypeScript)
- [Arguments](#Arguments)
- [Running the examples](#Running-the-examples)
- [PRs](#prs)
- [TODO](#TODO)
- [License](#license)

## Background

Cypress comes out of the box with a great set of tools, that allow both UI and API integration tests to be written. Unfortunatelly the cy.request() command is limited to REST endpoints only, so this library is here to help with those cases when WebSockets need to be called/tested as part of more complex integration/E2E tests.

## Installation

```bash
npm i -D @lensesio/cypress-websocket-testing
# or
yarn add -D @lensesio/cypress-websocket-testing
```

You also need to add `rxjs` to the project.
```bash
npm i -D rxjs
```

## Usage

### JavaScript

`@lensesio/cypress-websocket-testing` extends Cypress' `cy` command.

Add this line to your project's `cypress/support/commands.js`:

```
import { addStreamCommands } from '@lensesio/cypress-websocket-testing';
addStreamCommands();
```

Then, in your test, you can use both commands that come with this lib. cy.stream and cy.streamRequest.

```javascript
// For common cases:
cy.streamRequest(config, options).then(results => {
        expect(results).to.not.be.undefined;
})
// When in need of a bit more flexibility
cy.stream(config).then(subject => {
      subject
        .pipe(
          takeUntil(timer(1000)),
          reduce((acc , val) => acc.concat([val]), [])
        )
        .subscribe({
          next: (results) => {
            expect(results).to.not.be.undefined;
          },
          error: (err) => {},
          complete: done
        });
    });
```

### TypeScript

As the library is written in Typescript, you can pass the type of the message to the command and to the config/options object. ( make sure that you already configured your Cypress tests to work [with TS](https://github.com/bahmutov/add-typescript-to-cypress) )

First, add `@lensesio/cypress-websocket-testing` to the `cypress/tsconfig.json` file

```
{
  "compilerOptions": {
    "types": [
        "cypress",
        "@lensesio/cypress-websocket-testing"
    ]
  }
}
```

Then to use in TypeScript tests: 

```typescript
// For full set of config values, check rxjs documentation
const config: WebSocketSubjectConfig<IMessage> = {
  url: "ws://localhost:8080/"
};

let options: Partial<StreamRequestOptions<IMessage>>;

cy.streamRequest<IMessage>(config, options).then((results?: IMessage[]) => {
        expect(results).to.not.be.undefined;
})
cy.stream<IMessage>(config).then(subject => {
      subject
        .pipe(
          takeUntil(timer(1000)),
          reduce((acc: IMessage[], val: IMessage) => acc.concat([val]), [])
        )
        .subscribe({
          next: (results?: IMessage[]) => {
            expect(results).to.not.be.undefined;
          },
          error: (err: any) => {},
          complete: done
        });
    });
```

Note: 
There are some type conflicts when extending/adding operators to cy.stream() in tests directly. (due to  issues with Cypress including an old rxjs version as a dependency). Best way is to extend cy.stream() by building a custom command with it and use that instead.



## Arguments

- config

A [WebSocketSubjectConfig](https://rxjs-dev.firebaseapp.com/api/webSocket/WebSocketSubjectConfig) object. See official docs for more information. Is passed as is to the underlying webSocket subject.

- options:StreamRequestOptions (only for streamRequest command. Although optional, at least the takeWhileFn should be set)

Usage `cy.streamRequest(config, options)`.

| Option               | Default                | Description                                                                                                                                               |
| -------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `streamTimeout`           | `defaultCommandTimeout` | Time to wait for the stream to complete. (if is greater than Cypress defaultCommandTimeout, you need to use the cy.wrap as a workaround. Investigating alternative ways)                                                                                                                            |
| `retryDelay`            | `4000`                 | How long to way until a new connection attempt is made.                                                                   |
| `retryAttempts`           | `5`                  | How many times to retry the connection before completing.                                                                                                     |
| `startUpMessage`        | `any`          | A message to be sent on connection open.                                                                                                             |
| `takeWhileFn`             | `()=>false`          | Function that will tell the stream when to close. If not set, it will close on the first message received in order to avoid having an open connection. |
| `retryUntilFn`             | `()=>true`          | Function that will tell the stream how to check the results, and retry if the result is false. |


<br />
<br />

## Running the examples

In order to try this project locally, you need to `npm install` in both the root and the examples/ folder. 
After, build the library using `npm run build` in the root folder, then go to examples/ , start the websocket server `npm start` and cypress using `npm run test:local`.

## PRs

PRs are welcome. Be sure to add 
- Tests
- Reason for the PR 
<br />
When committing, remember to use `npm run commit`, in order to start commitizen.


## TODO
- [] Find a fix for the cy.wrap workaround.
- [] Improve error handling.
- [] Add more examples for cy.stream command.

## LICENSE

[Apache 2.0](LICENSE)