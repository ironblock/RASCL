import produce from "immer";
import "jest";
import {
  APIReducerState,
  handleRequest,
  handleSuccess,
  handleFailure,
  handleMistake,
  handleTimeout,
  handleOffline,
  initialEndpointState,
} from "../src/reducers";
import * as ExampleAPI from "./stubs/apiKy";

const INITIAL_STATE: APIReducerState<typeof ExampleAPI> = {
  getExample: initialEndpointState,
  putExample: initialEndpointState,
  postExample: initialEndpointState,
  patchExample: initialEndpointState,
  deleteExample: initialEndpointState,
};

let mockedDateNow: jest.SpyInstance<number, []>;

describe("API Reducers", () => {
  beforeAll(() => {
    mockedDateNow = jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2019-05-14T11:01:58.135Z").valueOf());
  });

  afterAll(() => {
    mockedDateNow?.mockRestore();
  });

  it("handles REQUEST actions", () => {
    const handledRequest = produce(INITIAL_STATE, (draft) => {
      handleRequest<"getExample", typeof ExampleAPI>("getExample", draft, {
        type: "GET_EXAMPLE_REQUEST",
        payload: [],
      });
    });

    expect(handledRequest).toMatchObject({
      getExample: {
        ...initialEndpointState,
        request: [],
        isFetching: true,
        lastUpdate: Date.now(),
        lastResult: "request",
      },
    });
  });

  it("handles SUCCESS actions", () => {
    const handledSuccess = produce(INITIAL_STATE, (draft) => {
      handleSuccess<"getExample", typeof ExampleAPI>("getExample", draft, {
        type: "GET_EXAMPLE_SUCCESS",
        payload: ["apples", "bananas", "coconuts"],
      });
    });

    expect(handledSuccess).toMatchObject({
      getExample: {
        ...initialEndpointState,
        success: ["apples", "bananas", "coconuts"],
        isFetching: false,
        lastUpdate: Date.now(),
        lastResult: "success",
      },
    });
  });

  it("handles FAILURE actions", () => {
    const error = new Error("The server goofed!");
    const handledFailure = produce(INITIAL_STATE, (draft) => {
      handleFailure<"getExample", typeof ExampleAPI>("getExample", draft, {
        type: "GET_EXAMPLE_FAILURE",
        error: true,
        payload: error,
      });
    });

    expect(handledFailure).toMatchObject({
      getExample: {
        ...initialEndpointState,
        failure: error,
        isFetching: false,
        lastUpdate: Date.now(),
        lastResult: "failure",
      },
    });
  });

  it("handles MISTAKE actions", () => {
    const error = new Error("You goofed!");
    const handledMistake = produce(INITIAL_STATE, (draft) => {
      handleMistake<"getExample", typeof ExampleAPI>("getExample", draft, {
        type: "GET_EXAMPLE_MISTAKE",
        payload: error,
        error: true,
      });
    });

    expect(handledMistake).toMatchObject({
      getExample: {
        ...initialEndpointState,
        mistake: error,
        isFetching: false,
        lastUpdate: Date.now(),
        lastResult: "mistake",
      },
    });
  });

  it("handles TIMEOUT actions", () => {
    const error = new Error("Waited forever and nothing happened!");
    const handledTimeout = produce(INITIAL_STATE, (draft) => {
      handleTimeout<"getExample", typeof ExampleAPI>("getExample", draft, {
        type: "GET_EXAMPLE_TIMEOUT",
        payload: error,
        error: true,
      });
    });

    expect(handledTimeout).toMatchObject({
      getExample: {
        ...initialEndpointState,
        timeout: error,
        isFetching: false,
        lastUpdate: Date.now(),
        lastResult: "timeout",
      },
    });
  });

  it("handles OFFLINE actions", () => {
    const error = new Error("You're not connected to Mr. Internet!");
    const handledOffline = produce(INITIAL_STATE, (draft) => {
      handleOffline<"getExample", typeof ExampleAPI>("getExample", draft, {
        type: "GET_EXAMPLE_OFFLINE",
        payload: error,
        error: true,
      });
    });

    expect(handledOffline).toMatchObject({
      getExample: {
        ...initialEndpointState,
        offline: error,
        isFetching: false,
        lastUpdate: Date.now(),
        lastResult: "offline",
      },
    });
  });
});
