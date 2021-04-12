/**
 * @jest-environment jsdom
 */

import { call } from "@redux-saga/core/effects";
import "jest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import { kyRequestSaga, requireAuth } from "../src/sagas";
import * as ExampleAPI from "./stubs/apiKy";
import {
  makeKyHTTPError400,
  makeKyHTTPError500,
  makeKyOfflineError,
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
      return expectSaga(() => saga)
        .call(requestKy200)
        .put(successAction)
        .run();
    });

    it("generates sagas that handle 5XX API failures", () => {
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKy500,
        handlers,
        requestAction,
      );

      return expectSaga(() => saga)
        .call(requestKy500)
        .put(failureAction)
        .run();
    });

    it("generates sagas that handle 4XX API failures", () => {
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKy400,
        handlers,
        requestAction,
      );

      return expectSaga(() => saga)
        .call(requestKy400)
        .put(mistakeAction)
        .run();
    });

    it("generates sagas that handle offline failures", () => {
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKyOffline,
        handlers,
        requestAction,
      );

      return expectSaga(() => saga)
        .call(requestKyOffline)
        .put(offlineAction)
        .run();
    });

    it("generates sagas that handle timeout failures", () => {
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKyTimeout,
        handlers,
        requestAction,
      );

      return expectSaga(() => saga)
        .call(requestKyTimeout)
        .put(timeoutAction)
        .run();
    });

    it("generates sagas that handle generic clientside errors", () => {
      const throwGenericError = () => Promise.reject(new Error("Something bad happened!"));
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        throwGenericError,
        handlers,
        requestAction,
      );

      return expectSaga(() => saga)
        .call(throwGenericError)
        .put(mistakeAction)
        .run();
    });

    it("generates sagas that handle unknown clientside errors", () => {
      const throwUnknownError = () => Promise.reject(undefined);
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        throwUnknownError,
        handlers,
        requestAction,
      );

      return expectSaga(() => saga)
        .call(throwUnknownError)
        .put(mistakeAction)
        .run();
    });
  });
});
