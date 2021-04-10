import "jest";
import { ActionCreatorsMap, createActions } from "../src/actions";
import { createTypeConstants } from "../src/constants";
import { RFSA, RFSE } from "../src/types/RFSA";
import * as ExampleAPI from "./stubs/apiKy";
import { ExampleEntity, GetResponse } from "./stubs/response";

const getTypes = createTypeConstants<typeof ExampleAPI, "getExample">("getExample");
const getActions: ActionCreatorsMap<typeof ExampleAPI>["getExample"] = createActions<
  typeof ExampleAPI,
  "getExample"
>(getTypes);

const postTypes = createTypeConstants<typeof ExampleAPI, "postExample">("postExample");
const postActions: ActionCreatorsMap<typeof ExampleAPI>["postExample"] = createActions<
  typeof ExampleAPI,
  "postExample"
>(postTypes);

describe("Action Creators", () => {
  it("generates action creators for provided API calling functions", () => {
    expect(getActions.request).toBeDefined();
    expect(getActions.success).toBeDefined();
    expect(getActions.failure).toBeDefined();
    expect(getActions.mistake).toBeDefined();
    expect(getActions.timeout).toBeDefined();
    expect(getActions.offline).toBeDefined();
  });

  it("generates a REQUEST action with the correct shape", () => {
    const request: RFSA<"GET_EXAMPLE_REQUEST", []> = getActions.request([]);

    expect(request).toMatchObject({ type: "GET_EXAMPLE_REQUEST", payload: [] });
  });

  it("generates a SUCCESS action with the correct shape", () => {
    const success: RFSA<"GET_EXAMPLE_SUCCESS", typeof GetResponse> = getActions.success(
      GetResponse,
    );

    expect(success).toMatchObject({ type: "GET_EXAMPLE_SUCCESS", payload: GetResponse });
  });

  it("generates a FAILURE action with the correct shape", () => {
    const error = new Error("The server said no");
    const failure: RFSE<"GET_EXAMPLE_FAILURE", Error> = getActions.failure(error);

    expect(failure).toMatchObject({ type: "GET_EXAMPLE_FAILURE", error: true, payload: error });
  });

  it("generates a MISTAKE action with the correct shape", () => {
    const error = new Error("You sent the wrong payload or weren't signed in");
    const mistake: RFSE<"GET_EXAMPLE_MISTAKE", Error> = getActions.mistake(error);

    expect(mistake).toMatchObject({ type: "GET_EXAMPLE_MISTAKE", error: true, payload: error });
  });

  it("generates a TIMEOUT action with the correct shape", () => {
    const error = new Error("We waited and the server never responded");
    const timeout: RFSE<"GET_EXAMPLE_TIMEOUT", Error> = getActions.timeout(error);

    expect(timeout).toMatchObject({ type: "GET_EXAMPLE_TIMEOUT", error: true, payload: error });
  });

  it("generates a OFFLINE action with the correct shape", () => {
    const error = new Error("You're offline, bud");
    const offline: RFSE<"GET_EXAMPLE_OFFLINE", Error> = getActions.offline(error);

    expect(offline).toMatchObject({ type: "GET_EXAMPLE_OFFLINE", error: true, payload: error });
  });

  it("correctly generates actions containing function arguments", () => {
    const entity: ExampleEntity = {
      fruit: "bananas",
      quantity: 99,
    };
    const post: RFSA<"POST_EXAMPLE_REQUEST", [ExampleEntity]> = postActions.request([entity]);

    expect(post).toMatchObject({
      type: "POST_EXAMPLE_REQUEST",
      payload: [entity],
    });
  });
});
