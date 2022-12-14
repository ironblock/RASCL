/**
 * @jest-environment jsdom
 */

import "jest";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import { throwError } from "redux-saga-test-plan/providers";
import { call } from "redux-saga/effects";

import { requireAuth } from "../../src/sagas";
import { kyPrivateRequestSaga, kyRequestSaga } from "../../src/sagas/ky";
import * as ExampleAPI from "../stubs/apiKy";
import { GetResponse } from "../stubs/entities";
import {
  kyHTTPError400,
  kyHTTPError500,
  kyHTTPErrorUnknown,
  kyOfflineError,
  kyTimeoutError,
} from "../stubs/ky";
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
} from "../stubs/static";

const actionCreatorsGet = createActionCreatorsGet();
const actionCreatorsDelete = createActionCreatorsDelete();

describe("Sagas using Ky", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("generates sagas that handle successful API responses", async () => {
    await expectSaga(() =>
      kyRequestSaga<"getExample", typeof ExampleAPI>(
        ExampleAPI.getExample,
        actionCreatorsGet,
        requestActionGet,
      ),
    )
      .dispatch(requestActionGet)
      .provide([[call(ExampleAPI.getExample), GetResponse]])
      .put(successActionGet)
      .run();
  });

  it("generates sagas that handle 5XX API failures", async () => {
    await expectSaga(() =>
      kyRequestSaga<"getExample", typeof ExampleAPI>(
        ExampleAPI.getExample,
        actionCreatorsGet,
        requestActionGet,
      ),
    )
      .dispatch(requestActionGet)
      .provide([[call(ExampleAPI.getExample), throwError(kyHTTPError500)]])
      .put(failureActionGet)
      .run();
  });

  it("generates sagas that handle 4XX API failures", async () => {
    await expectSaga(() =>
      kyRequestSaga<"getExample", typeof ExampleAPI>(
        ExampleAPI.getExample,
        actionCreatorsGet,
        requestActionGet,
      ),
    )
      .dispatch(requestActionGet)
      .provide([[call(ExampleAPI.getExample), throwError(kyHTTPError400)]])
      .put(mistakeActionGet)
      .run();
  });

  it("generates sagas that handle any other Ky failures", async () => {
    await expectSaga(() =>
      kyRequestSaga<"getExample", typeof ExampleAPI>(
        ExampleAPI.getExample,
        actionCreatorsGet,
        requestActionGet,
      ),
    )
      .dispatch(requestActionGet)
      .provide([[call(ExampleAPI.getExample), throwError(kyHTTPErrorUnknown)]])
      .put(mistakeActionGet)
      .run();
  });

  it("generates sagas that handle offline failures", async () => {
    await expectSaga(() =>
      kyRequestSaga<"getExample", typeof ExampleAPI>(
        ExampleAPI.getExample,
        actionCreatorsGet,
        requestActionGet,
      ),
    )
      .dispatch(requestActionGet)
      .provide([[call(ExampleAPI.getExample), throwError(kyOfflineError)]])
      .put(offlineActionGet)
      .run();
  });

  it("generates sagas that handle timeout failures", async () => {
    await expectSaga(() =>
      kyRequestSaga<"getExample", typeof ExampleAPI>(
        ExampleAPI.getExample,
        actionCreatorsGet,
        requestActionGet,
      ),
    )
      .dispatch(requestActionGet)
      .provide([[call(ExampleAPI.getExample), throwError(kyTimeoutError)]])
      .put(timeoutActionGet)
      .run();
  });

  it("generates sagas that handle generic clientside errors", async () => {
    await expectSaga(() =>
      kyRequestSaga<"getExample", typeof ExampleAPI>(
        ExampleAPI.getExample,
        actionCreatorsGet,
        requestActionGet,
      ),
    )
      .dispatch(requestActionGet)
      .provide([[call(ExampleAPI.getExample), throwError(new Error("Something bad happened!"))]])
      .put(mistakeActionGet)
      .run();
  });

  it("generates sagas that handle unknown clientside errors", async () => {
    await expectSaga(() =>
      kyRequestSaga<"getExample", typeof ExampleAPI>(
        ExampleAPI.getExample,
        actionCreatorsGet,
        requestActionGet,
      ),
    )
      .dispatch(requestActionGet)
      .provide([[call(ExampleAPI.getExample), throwError(undefined)]])
      .put(mistakeActionGet)
      .run();
  });

  it("generates sagas that call protected API endpoints after obtaining auth", () => {
    const actionType = actionTypes.deleteExample.enqueue;
    const getAuthentication = (): boolean => true;

    testSaga(() =>
      kyPrivateRequestSaga<"deleteExample", typeof ExampleAPI>(
        ExampleAPI.deleteExample,
        actionCreatorsDelete,
        enqueueActionDelete,
        actionType,
        getAuthentication,
      ),
    )
      .next()
      .fork(requireAuth, actionType, getAuthentication)
      .next()
      .fork(kyRequestSaga, ExampleAPI.deleteExample, actionCreatorsDelete, requestActionDelete)
      .finish()
      .isDone();
  });
});
