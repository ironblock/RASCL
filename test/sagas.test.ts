/**
 * @jest-environment jsdom
 */

import { put } from "@redux-saga/core/effects";
import "jest";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import { createWatcherSaga, kyPrivateRequestSaga, kyRequestSaga, requireAuth } from "../src/sagas";
import * as ExampleAPI from "./stubs/apiKy";
import { GetResponse } from "./stubs/entities";
import {
  makeKyHTTPError400,
  makeKyHTTPError500,
  makeKyHTTPErrorUnknown,
  makeKyOfflineError,
  makeKyTimeoutError,
} from "./stubs/ky";
import {
  actionTypes,
  createActionCreatorsDelete,
  createActionCreatorsGet,
  enqueueActionDelete,
  failureActionGet,
  mistakeActionGet,
  offlineActionGet,
  requestActionGet,
  requestActionDelete,
  successActionGet,
  timeoutActionGet,
} from "./stubs/static";

const requestKy200 = jest.fn(async () => await Promise.resolve(GetResponse));
const requestKy500 = jest.fn(() => makeKyHTTPError500());
const requestKy400 = jest.fn(() => makeKyHTTPError400());
const requestKyUnknown = jest.fn(() => makeKyHTTPErrorUnknown());
const requestKyTimeout = jest.fn(() => makeKyTimeoutError());
const requestKyOffline = jest.fn(() => makeKyOfflineError());
const actionCreatorsGet = createActionCreatorsGet();
const actionCreatorsDelete = createActionCreatorsDelete();

describe("Redux Sagas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Blocking Authentication Requirements", () => {
    it("blocks indefinitely when not authenticated", () => {
      const authenticated = false;
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
      const authenticated = true;
      const getAuthenticated = () => authenticated;
      const saga = expectSaga(requireAuth, "LOGIN_SUCCESS", getAuthenticated);

      saga.select(getAuthenticated).returns(true);
    });

    it("returns after looping when finally authenticated", () => {
      const authenticated = false;
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
    it("generates watcher sagas", () => {
      const saga = function* () {
        yield put(successActionGet);
      };
      const actionType = actionTypes.getExample.request;
      const apiCall = ExampleAPI.getExample;
      const watcher = createWatcherSaga(saga, actionType, apiCall, actionCreatorsGet);

      testSaga(watcher)
        .next()
        .takeLatest(actionType, saga, apiCall, actionCreatorsGet)
        .finish()
        .isDone();
    });
  });

  describe("Sagas using Ky", () => {
    it("generates sagas that call public API endpoints", () => {
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKy200,
        actionCreatorsGet,
        requestActionGet,
      );

      expectSaga(() => saga).call(requestKy200);
    });

    it("generates sagas that call protected API endpoints after obtaining auth", () => {
      const actionType = actionTypes.deleteExample.enqueue;
      const getAuthentication = () => true;
      const saga = kyPrivateRequestSaga<"deleteExample", typeof ExampleAPI>(
        actionType,
        getAuthentication,
        ExampleAPI.deleteExample,
        actionCreatorsDelete,
        enqueueActionDelete,
      );

      testSaga(() => saga)
        .next()
        .fork(requireAuth, actionType, getAuthentication)
        .next()
        .fork(kyRequestSaga, ExampleAPI.deleteExample, actionCreatorsDelete, requestActionDelete);
    });

    it("generates sagas that handle successful API responses", async () => {
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKy200,
        actionCreatorsGet,
        requestActionGet,
      );

      // Make API call
      return await expectSaga(() => saga)
        .call(requestKy200)
        .put(successActionGet)
        .run();
    });

    it("generates sagas that handle 5XX API failures", async () => {
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKy500,
        actionCreatorsGet,
        requestActionGet,
      );

      return await expectSaga(() => saga)
        .call(requestKy500)
        .put(failureActionGet)
        .run();
    });

    it("generates sagas that handle 4XX API failures", async () => {
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKy400,
        actionCreatorsGet,
        requestActionGet,
      );

      return await expectSaga(() => saga)
        .call(requestKy400)
        .put(mistakeActionGet)
        .run();
    });

    it("generates sagas that handle any other Ky failures", async () => {
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKyUnknown,
        actionCreatorsGet,
        requestActionGet,
      );

      return await expectSaga(() => saga)
        .call(requestKyUnknown)
        .put(mistakeActionGet)
        .run();
    });

    it("generates sagas that handle offline failures", async () => {
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKyOffline,
        actionCreatorsGet,
        requestActionGet,
      );

      return await expectSaga(() => saga)
        .call(requestKyOffline)
        .put(offlineActionGet)
        .run();
    });

    it("generates sagas that handle timeout failures", async () => {
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        requestKyTimeout,
        actionCreatorsGet,
        requestActionGet,
      );

      return await expectSaga(() => saga)
        .call(requestKyTimeout)
        .put(timeoutActionGet)
        .run();
    });

    it("generates sagas that handle generic clientside errors", async () => {
      const throwGenericError = async () =>
        await Promise.reject(new Error("Something bad happened!"));
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        throwGenericError,
        actionCreatorsGet,
        requestActionGet,
      );

      return await expectSaga(() => saga)
        .call(throwGenericError)
        .put(mistakeActionGet)
        .run();
    });

    it("generates sagas that handle unknown clientside errors", async () => {
      const throwUnknownError = async () => await Promise.reject(undefined);
      const saga = kyRequestSaga<"getExample", typeof ExampleAPI>(
        throwUnknownError,
        actionCreatorsGet,
        requestActionGet,
      );

      return await expectSaga(() => saga)
        .call(throwUnknownError)
        .put(mistakeActionGet)
        .run();
    });
  });
});
