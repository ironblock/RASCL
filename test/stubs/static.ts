import type { ActionCreators } from "../../src/actions";
import type { ActionTypeConstantsMap } from "../../src/constants";
import type { APIReducerState } from "../../src/reducers";
import { initialEndpointState } from "../../src/reducers";
import type { RFSA, RFSE } from "../../src/types/RFSA";
import type * as ExampleAPI from "./apiKy";
import type { FruitQuantity } from "./entities";
import { ExampleEntity, GetResponse } from "./entities";

export const INITIAL_STATE: APIReducerState<typeof ExampleAPI> = {
  getExample: initialEndpointState,
  putExample: initialEndpointState,
  postExample: initialEndpointState,
  patchExample: initialEndpointState,
  deleteExample: initialEndpointState,
};

export const actionTypes: ActionTypeConstantsMap<typeof ExampleAPI> = {
  getExample: {
    enqueue: "GET_EXAMPLE_ENQUEUE",
    request: "GET_EXAMPLE_REQUEST",
    success: "GET_EXAMPLE_SUCCESS",
    failure: "GET_EXAMPLE_FAILURE",
    mistake: "GET_EXAMPLE_MISTAKE",
    timeout: "GET_EXAMPLE_TIMEOUT",
    offline: "GET_EXAMPLE_OFFLINE",
  },
  putExample: {
    enqueue: "PUT_EXAMPLE_ENQUEUE",
    request: "PUT_EXAMPLE_REQUEST",
    success: "PUT_EXAMPLE_SUCCESS",
    failure: "PUT_EXAMPLE_FAILURE",
    mistake: "PUT_EXAMPLE_MISTAKE",
    timeout: "PUT_EXAMPLE_TIMEOUT",
    offline: "PUT_EXAMPLE_OFFLINE",
  },
  postExample: {
    enqueue: "POST_EXAMPLE_ENQUEUE",
    request: "POST_EXAMPLE_REQUEST",
    success: "POST_EXAMPLE_SUCCESS",
    failure: "POST_EXAMPLE_FAILURE",
    mistake: "POST_EXAMPLE_MISTAKE",
    timeout: "POST_EXAMPLE_TIMEOUT",
    offline: "POST_EXAMPLE_OFFLINE",
  },
  patchExample: {
    enqueue: "PATCH_EXAMPLE_ENQUEUE",
    request: "PATCH_EXAMPLE_REQUEST",
    success: "PATCH_EXAMPLE_SUCCESS",
    failure: "PATCH_EXAMPLE_FAILURE",
    mistake: "PATCH_EXAMPLE_MISTAKE",
    timeout: "PATCH_EXAMPLE_TIMEOUT",
    offline: "PATCH_EXAMPLE_OFFLINE",
  },
  deleteExample: {
    enqueue: "DELETE_EXAMPLE_ENQUEUE",
    request: "DELETE_EXAMPLE_REQUEST",
    success: "DELETE_EXAMPLE_SUCCESS",
    failure: "DELETE_EXAMPLE_FAILURE",
    mistake: "DELETE_EXAMPLE_MISTAKE",
    timeout: "DELETE_EXAMPLE_TIMEOUT",
    offline: "DELETE_EXAMPLE_OFFLINE",
  },
};

export const failureError = new Error("The server goofed!");
export const mistakeError = new Error("You goofed!");
export const timeoutError = new Error("Waited forever and nothing happened!");
export const offlineError = new Error("You're not connected to Mr. Internet!");

export const enqueueActionGet: RFSA<"GET_EXAMPLE_ENQUEUE", []> = {
  type: actionTypes.getExample.enqueue,
  payload: [],
};

export const requestActionGet: RFSA<"GET_EXAMPLE_REQUEST", []> = {
  type: actionTypes.getExample.request,
  payload: [],
};

export const successActionGet: RFSA<"GET_EXAMPLE_SUCCESS", typeof GetResponse> = {
  type: actionTypes.getExample.success,
  payload: GetResponse,
};

export const failureActionGet: RFSE<"GET_EXAMPLE_FAILURE", typeof failureError> = {
  type: actionTypes.getExample.failure,
  payload: failureError,
  error: true,
};

export const mistakeActionGet: RFSE<"GET_EXAMPLE_MISTAKE", typeof mistakeError> = {
  type: actionTypes.getExample.mistake,
  payload: mistakeError,
  error: true,
};

export const timeoutActionGet: RFSE<"GET_EXAMPLE_TIMEOUT", typeof timeoutError> = {
  type: actionTypes.getExample.timeout,
  payload: timeoutError,
  error: true,
};

export const offlineActionGet: RFSE<"GET_EXAMPLE_OFFLINE", typeof offlineError> = {
  type: actionTypes.getExample.offline,
  payload: offlineError,
  error: true,
};
export const enqueueActionDelete: RFSA<"DELETE_EXAMPLE_ENQUEUE", [FruitQuantity]> = {
  type: actionTypes.deleteExample.enqueue,
  payload: [ExampleEntity],
};

export const requestActionDelete: RFSA<"DELETE_EXAMPLE_REQUEST", [true, FruitQuantity]> = {
  type: actionTypes.deleteExample.request,
  payload: [true, ExampleEntity],
};

export const successActionDelete: RFSA<"DELETE_EXAMPLE_SUCCESS", string> = {
  type: actionTypes.deleteExample.success,
  payload: "Deleted",
};

export const failureActionDelete: RFSE<"DELETE_EXAMPLE_FAILURE", typeof failureError> = {
  type: actionTypes.deleteExample.failure,
  payload: failureError,
  error: true,
};

export const mistakeActionDelete: RFSE<"DELETE_EXAMPLE_MISTAKE", typeof mistakeError> = {
  type: actionTypes.deleteExample.mistake,
  payload: mistakeError,
  error: true,
};

export const timeoutActionDelete: RFSE<"DELETE_EXAMPLE_TIMEOUT", typeof timeoutError> = {
  type: actionTypes.deleteExample.timeout,
  payload: timeoutError,
  error: true,
};

export const offlineActionDelete: RFSE<"DELETE_EXAMPLE_OFFLINE", typeof offlineError> = {
  type: actionTypes.deleteExample.offline,
  payload: offlineError,
  error: true,
};

export const createActionCreatorsGet = (): ActionCreators<"getExample", typeof ExampleAPI> => ({
  enqueue: jest.fn(() => enqueueActionGet),
  request: jest.fn(() => requestActionGet),
  success: jest.fn(() => successActionGet),
  failure: jest.fn(() => failureActionGet),
  mistake: jest.fn(() => mistakeActionGet),
  timeout: jest.fn(() => timeoutActionGet),
  offline: jest.fn(() => offlineActionGet),
});

export const createActionCreatorsDelete = (): ActionCreators<
  "deleteExample",
  typeof ExampleAPI
> => ({
  enqueue: jest.fn(() => enqueueActionDelete),
  request: jest.fn(() => requestActionDelete),
  success: jest.fn(() => successActionDelete),
  failure: jest.fn(() => failureActionDelete),
  mistake: jest.fn(() => mistakeActionDelete),
  timeout: jest.fn(() => timeoutActionDelete),
  offline: jest.fn(() => offlineActionDelete),
});
