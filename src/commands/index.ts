import { Observable, throwError, of, timer } from "rxjs";
import { webSocket, WebSocketSubjectConfig } from "rxjs/webSocket";
import {
  takeUntil,
  takeWhile,
  retryWhen,
  delay,
  take,
  concat,
  reduce,
  switchMap
} from "rxjs/operators";

import { StreamRequestOptions } from "../internal/types";
import WebsocketOptionsDefaults from "../defaults/WebsocketOptionsDefaults";

type Command = {
  name: string;
  command: <T>(config: string | WebSocketSubjectConfig<T>) => Observable<T>;
};

type RequestCommand = {
  name: string;
  command: <T>(
    config: string | WebSocketSubjectConfig<T>,
    options: Partial<StreamRequestOptions<T>>
  ) => Promise<T[] | void>;
};

export const streamCommand: Command = {
  name: "stream",
  command: <T>(config: string | WebSocketSubjectConfig<T>) => webSocket(config)
};

export const streamRequestCommand: RequestCommand = {
  name: "streamRequest",
  command: <T>(
    config: string | WebSocketSubjectConfig<T>,
    options: Partial<StreamRequestOptions<T>>
  ) => {
    Cypress.log({
      name: streamRequestCommand.name
    });

    const streamOptions = Object.assign({}, WebsocketOptionsDefaults, options);
    const {
      retryDelay,
      retryAttempts,
      streamTimeout,
      startUpMessage,
      retryUntilFn,
      takeWhileFn
    } = streamOptions;

    let streamConfig: WebSocketSubjectConfig<T> = {
      url: ""
    };

    if (typeof config === "string") {
      streamConfig.url = config;
    } else {
      streamConfig = Object.assign(
        {
          openObserver: {
            next: () => {
              if (startUpMessage) {
                stream.next(startUpMessage);
              }
            }
          }
        },
        config
      );
    }

    const stream = webSocket<T>(streamConfig);

    return stream
      .pipe(
        takeWhile(takeWhileFn, true),
        reduce((acc: T[], val: T) => acc.concat([val]), []),
        // If data is not ready, retry connection
        switchMap(result =>
          retryUntilFn(result)
            ? of(result)
            : throwError(
                new Error("Data not what was expected. Retrying connection.")
              )
        ),
        retryWhen(errors =>
          errors.pipe(
            delay(retryDelay),
            take(retryAttempts),
            concat(throwError(new Error("Error connecting to WebSocket")))
          )
        ),
        takeUntil(timer(streamTimeout))
      )
      .toPromise();
  }
};

export const addStreamCommands = () => {
  Cypress.Commands.add(streamCommand.name, streamCommand.command);
  Cypress.Commands.add(streamRequestCommand.name, streamRequestCommand.command);
};
