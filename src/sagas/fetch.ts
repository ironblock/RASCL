import type { Action } from "redux";
import type { SagaIterator } from "redux-saga";
import type { ActionPattern } from "redux-saga/effects";
import { call, fork, put } from "redux-saga/effects";
import type { JsonValue } from "type-fest";
import type { First, Prepend } from "typescript-tuple";

import { requireAuth } from ".";
import type { ActionCreatorsMap, EnqueueAction, RequestAction } from "../actions";
import { doesNotUseParams } from "../actions";
import { FailureError, MistakeError, NetworkError, OfflineError } from "../errors";
import type {
  APICallNoParams,
  APICallWithAuthentication,
  APICallWithParams,
  APIFunctionMap,
  APIFunctionMapWithAuthentication,
  RequestParameters,
} from "../types/API";
import type { AuthenticationSelector } from "../types/sagas";

export type ParsedBody = string | JsonValue | ArrayBuffer | FormData | Blob | undefined;

/**
 * Necessary abstraction to provide type expectations for un-parsed bodies.
 * Otherwise, TypeScript has no indication of what method on Response might be
 * called, and what the data type is going to be.
 *
 * @param T The expected return type of the body after parsing.
 */
export interface TypedResponse<T extends ParsedBody> extends Response {
  text: () => Promise<T & string>;
  json: () => Promise<T & JsonValue>;
  blob: () => Promise<T & Blob>;
  formData: () => Promise<T & FormData>;
  arrayBuffer: () => Promise<T & ArrayBuffer>;
}

/**
 * A little bit of magic - looks at the media type  Not meant to be used forever, just something that will
 * work for simple cases and fast starts.
 *
 * @param response
 */
export const parseBasedOnContentType = async <T>(
  response: TypedResponse<T>,
): Promise<ParsedBody> => {
  const contentType = response.headers.get("content-type");

  if (typeof contentType === "string") {
    const [type, subtype] = contentType.split("/");

    switch (type) {
      case "application":
        if (subtype.includes("json")) {
          return await response.json();
        } else {
          console.warn(
            `${response.url}\nSpecial handling for "${contentType}" body not implemented, trying text`,
          );
          return await response.text();
        }
      case "audio":
        return await response.arrayBuffer();

      case "image":
        return await response.blob();

      case "multipart":
        return await response.formData();

      case "text":
        return await response.text();

      default:
        console.warn(
          `${response.url}\nDidn't know what to do with a "${contentType}" body, trying text`,
        );
        return await response.text();
    }
  } else if (response.body) {
    if (response.bodyUsed) {
      console.error(
        `${response.url}\nThe body for this Response was already read. If you really need to read it again, use Response.clone() and pass that instance into this function.`,
      );
      return undefined;
    } else {
      console.warn(`${response.url}\nResponse had no content-type header, falling back to text`);
      return await response.text();
    }
  }

  return undefined;
};

/**
 * A Response object returned from a failed Fetch call can be automatically
 * refined to a more specific type according to this extremely simple strategy.
 *
 * @param response A Response object. This can be returned by a simple
 * fetch(...).then(...) chain, or may be thrown by a library like ky.
 */
export function* triageResponseFailure<K extends string & keyof M, M extends APIFunctionMap>(
  actionCreators: ActionCreatorsMap<M>[K],
  response: Response,
): SagaIterator<void> {
  switch (response.status % 100) {
    case 4:
      /**
       * 4XX - Client Error
       * Mapped to MISTAKE. There's either an error in the application, or the
       * user is trying to do something they can't or shouldn't do. A custom
       * solution for MISTAKE might involve checking for credentials, or a saga
       * that blocks on authentication, then retries the call with the last
       * cached value of REQUEST.
       */
      yield put(
        actionCreators.mistake(
          new MistakeError(response, [response.status, response.statusText].join(" - ")),
        ),
      );
      return;

    case 5:
      /**
       * 5XX - Server Error
       * Mapped to FAILURE. There's likely no remedy for this. The user may want
       * to retry, or they may want to contact support.
       */
      yield put(
        actionCreators.failure(
          new FailureError(response, [response.status, response.statusText].join(" - ")),
        ),
      );
      return;

    default:
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        /**
         * Offline Error
         * All indication is that the request can't succeed because the user
         * isn't connected and there's nothing in the browser cache or a service
         * worker that will resolve successfully.
         */
        yield put(
          actionCreators.offline(new OfflineError(response, "The browser is currently offline")),
        );
      }
  }
}

/**
 * A fast way to prototype API clients. Not optimal in production.
 */
export function* automaticFetchRequest<K extends string & keyof M, M extends APIFunctionMap>(
  request: M[K],
  actionCreators: ActionCreatorsMap<M>[K],
  { payload }: RequestAction<K, M>,
): SagaIterator<void> {
  try {
    const response: TypedResponse<ReturnType<M[K]>> | (ReturnType<M[K]> & JsonValue) | undefined =
      yield doesNotUseParams(request, payload)
        ? call<APICallNoParams>(request)
        : call<APICallWithParams | APICallWithAuthentication>(request, ...payload);

    if (response instanceof Response) {
      const body: ReturnType<M[K]> = yield call(parseBasedOnContentType, response);

      if (response.ok) {
        yield put(actionCreators.success(body));
      } else {
        throw new NetworkError({ response, body });
      }
    } else {
      throw new NetworkError({ body: response });
    }
  } catch (error: unknown) {
    if (error instanceof NetworkError) {
      if (error.response instanceof Response) {
        triageResponseFailure(actionCreators, error.response);
      } else if (typeof error.body !== "undefined") {
        console.warn(
          `Prefer passing functions that return a Response to automaticFetchRequest. Without more detail, this error is reported as a generic FAILURE.`,
        );
        yield put(actionCreators.failure(new FailureError(null, error.body)));
      } else {
        console.error(
          `Malformed NetworkError: both "body" and "response" were missing. Without more detail, this error is reported as a generic MISTAKE.`,
        );
        yield put(actionCreators.failure(new MistakeError(null, error.message || "Unknown error")));
      }
    } else {
      yield put(
        actionCreators.mistake(
          new MistakeError(
            null,
            typeof (error as Error)?.message === "string"
              ? (error as Error).message
              : "Unknown error",
          ),
        ),
      );
    }
  }
}

export function* automaticFetchEnqueue<
  K extends string & keyof M,
  M extends APIFunctionMap & APIFunctionMapWithAuthentication,
>(
  request: M[K] & APICallWithAuthentication,
  actionCreators: ActionCreatorsMap<M>[K],
  { payload }: EnqueueAction<K, M>,
  pattern: ActionPattern<Action<any>>,
  getAuthentication: AuthenticationSelector<First<Parameters<M[K]>>>,
): SagaIterator<void> {
  const authentication = yield fork(requireAuth, pattern, getAuthentication);
  const authorizedPayload: Prepend<typeof payload, typeof authentication> &
    RequestParameters<K, M> = [authentication, ...(payload ?? [])];
  const authorizedRequest = actionCreators.request(authorizedPayload);

  /**
   * TODO: This shouldn't be typed as fork<any>, but it's fiendishly difficult
   * to provide the correct typing. TypeScript seems to correctly infer the
   * actual internal types of each parameter, so hopefully this is just missing
   * some narrowing and not actually introducting an overly permissive type.
   */
  yield fork<any>(automaticFetchRequest, request, actionCreators, authorizedRequest);
}
