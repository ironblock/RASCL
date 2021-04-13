import produce from "immer";
import "jest";
import {
  handleEnqueue,
  handleRequest,
  handleSuccess,
  handleFailure,
  handleMistake,
  handleTimeout,
  handleOffline,
  initialEndpointState,
} from "../src/reducers";
import {
  enqueueActionDelete,
  requestActionGet,
  successActionGet,
  failureActionGet,
  mistakeActionGet,
  timeoutActionGet,
  offlineActionGet,
  failureError,
  mistakeError,
  offlineError,
  timeoutError,
  INITIAL_STATE,
} from "./stubs/static";
import * as ExampleAPI from "./stubs/apiKy";
import { ExampleEntity } from "./stubs/entities";

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

  it("handles ENQUEUE actions", () => {
    const handledEnqueue = produce(INITIAL_STATE, (draft) => {
      handleEnqueue<"deleteExample", typeof ExampleAPI>(
        "deleteExample",
        draft,
        enqueueActionDelete,
      );
    });

    expect(handledEnqueue).toMatchObject({
      deleteExample: {
        ...initialEndpointState,
        enqueue: [ExampleEntity],
        isFetching: true,
        lastUpdate: Date.now(),
        lastResult: "enqueue",
      },
    });
  });

  it("handles REQUEST actions", () => {
    const handledRequest = produce(INITIAL_STATE, (draft) => {
      handleRequest<"getExample", typeof ExampleAPI>("getExample", draft, requestActionGet);
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

  it("handles REQUEST actions", () => {
    const handledRequest = produce(INITIAL_STATE, (draft) => {
      handleRequest<"getExample", typeof ExampleAPI>("getExample", draft, requestActionGet);
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
      handleSuccess<"getExample", typeof ExampleAPI>("getExample", draft, successActionGet);
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
    const handledFailure = produce(INITIAL_STATE, (draft) => {
      handleFailure<"getExample", typeof ExampleAPI>("getExample", draft, failureActionGet);
    });

    expect(handledFailure).toMatchObject({
      getExample: {
        ...initialEndpointState,
        failure: failureError,
        isFetching: false,
        lastUpdate: Date.now(),
        lastResult: "failure",
      },
    });
  });

  it("handles MISTAKE actions", () => {
    const handledMistake = produce(INITIAL_STATE, (draft) => {
      handleMistake<"getExample", typeof ExampleAPI>("getExample", draft, mistakeActionGet);
    });

    expect(handledMistake).toMatchObject({
      getExample: {
        ...initialEndpointState,
        mistake: mistakeError,
        isFetching: false,
        lastUpdate: Date.now(),
        lastResult: "mistake",
      },
    });
  });

  it("handles TIMEOUT actions", () => {
    const handledTimeout = produce(INITIAL_STATE, (draft) => {
      handleTimeout<"getExample", typeof ExampleAPI>("getExample", draft, timeoutActionGet);
    });

    expect(handledTimeout).toMatchObject({
      getExample: {
        ...initialEndpointState,
        timeout: timeoutError,
        isFetching: false,
        lastUpdate: Date.now(),
        lastResult: "timeout",
      },
    });
  });

  it("handles OFFLINE actions", () => {
    const handledOffline = produce(INITIAL_STATE, (draft) => {
      handleOffline<"getExample", typeof ExampleAPI>("getExample", draft, offlineActionGet);
    });

    expect(handledOffline).toMatchObject({
      getExample: {
        ...initialEndpointState,
        offline: offlineError,
        isFetching: false,
        lastUpdate: Date.now(),
        lastResult: "offline",
      },
    });
  });
});
