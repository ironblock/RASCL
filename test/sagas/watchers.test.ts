/**
 * @jest-environment jsdom
 */

import "jest";
import { put } from "@redux-saga/core/effects";
import { testSaga } from "redux-saga-test-plan";

import { createWatcherSaga } from "../../src/sagas";
import * as ExampleAPI from "../stubs/apiKy";
import { actionTypes, createActionCreatorsGet, successActionGet } from "../stubs/static";

const actionCreatorsGet = createActionCreatorsGet();

describe("Watcher Sagas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("generates watcher sagas", () => {
    const saga = function* (): Generator<any, any, any> {
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
