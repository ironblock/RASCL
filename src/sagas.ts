import {
  call,
  put,
  takeLatest,
  all,
  spawn,
  StrictEffect,
  CallEffect,
  SagaReturnType,
} from "redux-saga/effects";

import ky from "ky";
import { APIFunctionMap, GenericAPICall } from "./types/API";
import { FSA } from "./types/FSA";
import { ActionCreatorsMap } from "./actions";

export function* watcherSaga() {}

/**
 * PUBLIC ENDPOINT (KY)
 *
 * A standard API request made to an open (non-authenticated) endpoint.
 *
 * @param requestMethod
 * @param action
 */
export function* kyPublicRequestSaga<M extends APIFunctionMap, S extends string & keyof M>(
  request: M[S],
  action: ReturnType<ActionCreatorsMap<M>[S]["request"]>,
): Generator<StrictEffect, void> {
  try {
    const response = yield call<M[S]>(request, action.payload);
  } catch (error) {
    if (error instanceof ky.HTTPError) {
    } else if (error instanceof ky.TimeoutError) {
    }
  }
}

export function* kyPrivateRequestSaga() {}

