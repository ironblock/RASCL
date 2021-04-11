/**
 * @jest-environment jsdom
 */

import { call } from "@redux-saga/core/effects";
import "jest";
import { put } from "redux-saga/effects";
import { kyPublicRequestSaga } from "../src/sagas";
import * as ExampleAPI from "./stubs/apiKy";
import {
  kyHTTPError400,
  kyHTTPError500,
  kyOfflineError,
  kyTimeoutError,
  makeKyHTTPError400,
  makeKyHTTPError500,
  makeKyTimeoutError,
} from "./stubs/ky";
import { GetResponse } from "./stubs/response";
import {
  createMockActionCreators,
  failureAction,
  mistakeAction,
  offlineAction,
  requestAction,
  successAction,
  timeoutAction,
} from "./stubs/static";

const requestKy200 = jest.fn(() => Promise.resolve(GetResponse));
const requestKy500 = jest.fn(() => makeKyHTTPError500());
const requestKy400 = jest.fn(() => makeKyHTTPError400());
const requestKyTimeout = jest.fn(() => makeKyTimeoutError());
const requestKyOffline = jest.fn(() => makeKyOfflineError());
const handlers = createMockActionCreators();

describe("Redux Sagas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Sagas using Ky", () => {
    it("generates sagas that call public API endpoints", () => {
      const saga = kyPublicRequestSaga<"getExample", typeof ExampleAPI>(
        requestKy200,
        handlers,
        requestAction,
      );

      expect(saga.next().value).toMatchObject(call(requestKy200));
    });

    it("generates sagas that handle successful API responses", () => {
      const saga = kyPublicRequestSaga<"getExample", typeof ExampleAPI>(
        requestKy200,
        handlers,
        requestAction,
      );

      // Make API call
      saga.next();
      expect(saga.next().value).toMatchObject(put(successAction));
      expect(handlers.success).toBeCalledTimes(1);
      expect(handlers.success).toBeCalledTimes(1);
      expect(saga.next().done).toEqual(true);
    });

    it("generates sagas that handle 5XX API failures", () => {
      const payload = kyHTTPError500;
      const saga = kyPublicRequestSaga<"getExample", typeof ExampleAPI>(
        requestKy500,
        handlers,
        requestAction,
      );

      saga.next();
      expect(saga.throw(payload).value).toMatchObject(put(failureAction));
      expect(handlers.failure).toBeCalledTimes(1);
      expect(saga.next().done).toEqual(true);
    });

    it("generates sagas that handle 4XX API failures", () => {
      const payload = kyHTTPError400;
      const saga = kyPublicRequestSaga<"getExample", typeof ExampleAPI>(
        requestKy400,
        handlers,
        requestAction,
      );

      saga.next();
      expect(saga.throw(payload).value).toMatchObject(put(mistakeAction));
      expect(handlers.mistake).toBeCalledTimes(1);
      expect(saga.next().done).toEqual(true);
    });

    it("generates sagas that handle offline failures", () => {
      const payload = kyOfflineError;
      const saga = kyPublicRequestSaga<"getExample", typeof ExampleAPI>(
        requestKyOffline,
        handlers,
        requestAction,
      );

      saga.next();
      expect(saga.throw(payload).value).toMatchObject(put(offlineAction));
      expect(handlers.offline).toBeCalledTimes(1);
      expect(saga.next().done).toEqual(true);
    });

    it("generates sagas that handle timeout failures", () => {
      const payload = kyTimeoutError;
      const saga = kyPublicRequestSaga<"getExample", typeof ExampleAPI>(
        requestKyTimeout,
        handlers,
        requestAction,
      );

      saga.next();
      expect(saga.throw(payload).value).toMatchObject(put(timeoutAction));
      expect(handlers.timeout).toBeCalledTimes(1);
      expect(saga.next().done).toEqual(true);
    });

    it("generates sagas that handle generic clientside errors", () => {
      const payload = new Error("Something bad happened!");
      const saga = kyPublicRequestSaga<"getExample", typeof ExampleAPI>(
        () => Promise.reject(new Error("Something bad happened!")),
        handlers,
        requestAction,
      );

      saga.next();
      expect(saga.throw(payload).value).toMatchObject(put(mistakeAction));
      expect(handlers.mistake).toBeCalledTimes(1);
      expect(saga.next().done).toEqual(true);
    });

    it("generates sagas that handle unknown clientside errors", () => {
      const payload = undefined;
      const saga = kyPublicRequestSaga<"getExample", typeof ExampleAPI>(
        () => Promise.reject(undefined),
        handlers,
        requestAction,
      );

      saga.next();
      expect(saga.throw(payload).value).toMatchObject(put(mistakeAction));
      expect(handlers.mistake).toBeCalledTimes(1);
      expect(saga.next().done).toEqual(true);
    });
  });

  it("generates watcher sagas", () => {});
});
function makeKyOfflineError(): any {
  throw new Error("Function not implemented.");
}
