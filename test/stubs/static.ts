import { ActionTypeConstantsMap } from "../../src/constants";
import { APIReducerState, initialEndpointState } from "../../src/reducers";
import { RFSA, RFSE } from "../../src/types/RFSA";
import * as ExampleAPI from "./apiKy";
import { GetResponse } from "./response";

const INITIAL_STATE: APIReducerState<typeof ExampleAPI> = {
  getExample: initialEndpointState,
  putExample: initialEndpointState,
  postExample: initialEndpointState,
  patchExample: initialEndpointState,
  deleteExample: initialEndpointState,
};

export const actionTypes: ActionTypeConstantsMap<typeof ExampleAPI> = {
  getExample: {
    request: "GET_EXAMPLE_REQUEST",
    success: "GET_EXAMPLE_SUCCESS",
    failure: "GET_EXAMPLE_FAILURE",
    mistake: "GET_EXAMPLE_MISTAKE",
    timeout: "GET_EXAMPLE_TIMEOUT",
    offline: "GET_EXAMPLE_OFFLINE",
  },
  putExample: {
    request: "PUT_EXAMPLE_REQUEST",
    success: "PUT_EXAMPLE_SUCCESS",
    failure: "PUT_EXAMPLE_FAILURE",
    mistake: "PUT_EXAMPLE_MISTAKE",
    timeout: "PUT_EXAMPLE_TIMEOUT",
    offline: "PUT_EXAMPLE_OFFLINE",
  },
  postExample: {
    request: "POST_EXAMPLE_REQUEST",
    success: "POST_EXAMPLE_SUCCESS",
    failure: "POST_EXAMPLE_FAILURE",
    mistake: "POST_EXAMPLE_MISTAKE",
    timeout: "POST_EXAMPLE_TIMEOUT",
    offline: "POST_EXAMPLE_OFFLINE",
  },
  patchExample: {
    request: "PATCH_EXAMPLE_REQUEST",
    success: "PATCH_EXAMPLE_SUCCESS",
    failure: "PATCH_EXAMPLE_FAILURE",
    mistake: "PATCH_EXAMPLE_MISTAKE",
    timeout: "PATCH_EXAMPLE_TIMEOUT",
    offline: "PATCH_EXAMPLE_OFFLINE",
  },
  deleteExample: {
    request: "DELETE_EXAMPLE_REQUEST",
    success: "DELETE_EXAMPLE_SUCCESS",
    failure: "DELETE_EXAMPLE_FAILURE",
    mistake: "DELETE_EXAMPLE_MISTAKE",
    timeout: "DELETE_EXAMPLE_TIMEOUT",
    offline: "DELETE_EXAMPLE_OFFLINE",
  },
};

export const requestAction: RFSA<"GET_EXAMPLE_REQUEST", []> = {
  type: actionTypes["getExample"].request,
  payload: [],
};

export const successAction: RFSA<"GET_EXAMPLE_SUCCESS", typeof GetResponse> = {
  type: actionTypes["getExample"].success,
  payload: GetResponse,
};

export const failureError = new Error("The server goofed!");
export const failureAction: RFSE<"GET_EXAMPLE_FAILURE", typeof failureError> = {
  type: actionTypes["getExample"].failure,
  payload: failureError,
  error: true,
};

export const mistakeError = new Error("You goofed!");
export const mistakeAction: RFSE<"GET_EXAMPLE_MISTAKE", typeof mistakeError> = {
  type: actionTypes["getExample"].mistake,
  payload: mistakeError,
  error: true,
};

export const timeoutError = new Error("Waited forever and nothing happened!");
export const timeoutAction: RFSE<"GET_EXAMPLE_TIMEOUT", typeof timeoutError> = {
  type: actionTypes["getExample"].timeout,
  payload: timeoutError,
  error: true,
};

export const offlineError = new Error("You're not connected to Mr. Internet!");
export const offlineAction: RFSE<"GET_EXAMPLE_OFFLINE", typeof offlineError> = {
  type: actionTypes["getExample"].offline,
  payload: offlineError,
  error: true,
};

export const createMockActionCreators = () => ({
  request: jest.fn(() => requestAction),
  success: jest.fn(() => successAction),
  failure: jest.fn(() => failureAction),
  mistake: jest.fn(() => mistakeAction),
  timeout: jest.fn(() => timeoutAction),
  offline: jest.fn(() => offlineAction),
});
