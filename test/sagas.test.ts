/**
 * @jest-environment jsdom
 */

import { call, StrictEffect } from "@redux-saga/core/effects";
import "jest";
import { fork, ForkEffect, put, select, take } from "redux-saga/effects";
import { kyRequestSaga, requireAuth } from "../src/sagas";
import * as ExampleAPI from "./stubs/apiKy";
import * as matchers from "redux-saga-test-plan/matchers";
import { expectSaga } from "redux-saga-test-plan";
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

  describe("Blocking Authentication Requirements", () => {
    it("blocks indefinitely when not authenticated", () => {
      let authenticated = false;
      const getAuthenticated = () => authenticated;
      const saga = expectSaga(requireAuth, "LOGIN_SUCCESS", getAuthenticated);

      saga
        .select(getAuthenticated)
        .take("LOGIN_SUCCESS")
        .select(getAuthenticated)
        .take("LOGIN_SUCCESS")
        .select(getAuthenticated)
        .silentRun();
    });

    it("returns without looping when already authenticated", () => {
      let authenticated = true;
      const getAuthenticated = () => authenticated;
      const saga = expectSaga(requireAuth, "LOGIN_SUCCESS", getAuthenticated);

      saga.select(getAuthenticated).returns(true);
    });

    it("returns after looping when finally authenticated", () => {
      let authenticated = false;
      const getAuthenticated = () => authenticated;
      const saga = expectSaga(requireAuth, "LOGIN_SUCCESS", getAuthenticated);

      saga
        .select(getAuthenticated)
        .take("LOGIN_SUCCESS")
        .select(getAuthenticated)
        .take("LOGIN_SUCCESS")
        .provide([matchers.select(getAuthenticated), true])
        .returns(true);
    });
  });

  describe("Watcher Sagas", () => {
    it("generates watcher sagas", () => {});
  });

  describe("Sagas using Ky", () => {
    it("generates sagas that call public API endpoints", () => {
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKy200,
        handlers,
        requestAction,
      );

      expect(saga.next().value).toMatchObject(call(requestKy200));
    });

    it("generates sagas that handle successful API responses", () => {
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKy200,
        handlers,
        requestAction,
      );

      // Make API call
      saga.next();
      expect(saga.next().value).toMatchObject(put(successAction));
      expect(handlers.success).toBeCalledTimes(1);
      expect(saga.next().done).toBe(true);
    });

    it("generates sagas that handle 5XX API failures", () => {
      const payload = kyHTTPError500;
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKy500,
        handlers,
        requestAction,
      );

      saga.next();
      expect(saga.throw(payload).value).toMatchObject(put(failureAction));
      expect(handlers.failure).toBeCalledTimes(1);
      expect(saga.next().done).toBe(true);
    });

    it("generates sagas that handle 4XX API failures", () => {
      const payload = kyHTTPError400;
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKy400,
        handlers,
        requestAction,
      );

      saga.next();
      expect(saga.throw(payload).value).toMatchObject(put(mistakeAction));
      expect(handlers.mistake).toBeCalledTimes(1);
      expect(saga.next().done).toBe(true);
    });

    it("generates sagas that handle offline failures", () => {
      const payload = kyOfflineError;
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKyOffline,
        handlers,
        requestAction,
      );

      saga.next();
      expect(saga.throw(payload).value).toMatchObject(put(offlineAction));
      expect(handlers.offline).toBeCalledTimes(1);
      expect(saga.next().done).toBe(true);
    });

    it("generates sagas that handle timeout failures", () => {
      const payload = kyTimeoutError;
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKyTimeout,
        handlers,
        requestAction,
      );

      saga.next();
      expect(saga.throw(payload).value).toMatchObject(put(timeoutAction));
      expect(handlers.timeout).toBeCalledTimes(1);
      expect(saga.next().done).toBe(true);
    });

    it("generates sagas that handle generic clientside errors", () => {
      const payload = new Error("Something bad happened!");
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        () => Promise.reject(new Error("Something bad happened!")),
        handlers,
        requestAction,
      );

      saga.next();
      expect(saga.throw(payload).value).toMatchObject(put(mistakeAction));
      expect(handlers.mistake).toBeCalledTimes(1);
      expect(saga.next().done).toBe(true);
    });

    it("generates sagas that handle unknown clientside errors", () => {
      const payload = undefined;
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        () => Promise.reject(undefined),
        handlers,
        requestAction,
      );

      saga.next();
      expect(saga.throw(payload).value).toMatchObject(put(mistakeAction));
      expect(handlers.mistake).toBeCalledTimes(1);
      expect(saga.next().done).toBe(true);
    });
  });
});
function makeKyOfflineError(): any {
  throw new Error("Function not implemented.");
}
