import "jest";
import { ActionCreatorsMap, createActions } from "../src/actions";
import { createTypeConstants } from "../src/constants";
import * as ExampleAPI from "./stubs/api";

let actionTypes;
let actions: ActionCreatorsMap<typeof ExampleAPI>["getExample"];

describe("Action Creators", () => {
  beforeAll(() => {
    actionTypes = createTypeConstants<typeof ExampleAPI, "getExample">("getExample");
    actions = createActions<typeof ExampleAPI, "getExample">(actionTypes);
  });

  it("generates action creators for provided API calling functions", () => {
    expect(actions.request).toBeDefined();
    expect(actions.success).toBeDefined();
    expect(actions.failure).toBeDefined();
    expect(actions.mistake).toBeDefined();
    expect(actions.timeout).toBeDefined();
    expect(actions.offline).toBeDefined();
  });

  it("generates a REQUEST action with the correct shape", () => {
    const request = actions.request();

    expect(request).toMatchObject({ type: "GET_EXAMPLE_REQUEST" });
  });

  it("generates a SUCCESS action with the correct shape", () => {
    const success = actions.success();

    expect(success).toMatchObject({ type: "GET_EXAMPLE_SUCCESS" });
  });

  it("generates a FAILURE action with the correct shape", () => {
    const error = new Error("The server said no");
    const failure = actions.failure(error);

    expect(failure).toMatchObject({ type: "GET_EXAMPLE_FAILURE", error: true, payload: error });
  });

  it("generates a MISTAKE action with the correct shape", () => {
    const error = new Error("You sent the wrong payload or weren't signed in");
    const mistake = actions.mistake(error);

    expect(mistake).toMatchObject({ type: "GET_EXAMPLE_MISTAKE", error: true, payload: error });
  });

  it("generates a TIMEOUT action with the correct shape", () => {
    const error = new Error("We waited and the server never responded");
    const timeout = actions.timeout(error);

    expect(timeout).toMatchObject({ type: "GET_EXAMPLE_TIMEOUT", error: true, payload: error });
  });

  it("generates a OFFLINE action with the correct shape", () => {
    const error = new Error("You're offline, bud");
    const offline = actions.offline(error);

    expect(offline).toMatchObject({ type: "GET_EXAMPLE_OFFLINE", error: true, payload: error });
  });
});
