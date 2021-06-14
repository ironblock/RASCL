import "jest";
import { ActionCreatorsMap, createActions } from "../src/actions";
import { createTypeConstants } from "../src/constants";
import { RFSA, RFSE } from "../src/types/RFSA";
import * as ExampleAPI from "./stubs/apiKy";
import { ExampleEntity, FruitQuantity, GetResponse } from "./stubs/entities";

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

const deleteTypes = createTypeConstants<typeof ExampleAPI, "deleteExample">("deleteExample");
const deleteActions: ActionCreatorsMap<typeof ExampleAPI>["deleteExample"] = createActions<
  typeof ExampleAPI,
  "deleteExample"
>(deleteTypes);

describe("Action Creators", () => {
  it("generates action creators for provided API calling functions", () => {
    expect(getActions.enqueue).toBeDefined();
    expect(getActions.request).toBeDefined();
    expect(getActions.success).toBeDefined();
    expect(getActions.failure).toBeDefined();
    expect(getActions.mistake).toBeDefined();
    expect(getActions.timeout).toBeDefined();
    expect(getActions.offline).toBeDefined();

    expect(postActions.enqueue).toBeDefined();
    expect(postActions.request).toBeDefined();
    expect(postActions.success).toBeDefined();
    expect(postActions.failure).toBeDefined();
    expect(postActions.mistake).toBeDefined();
    expect(postActions.timeout).toBeDefined();
    expect(postActions.offline).toBeDefined();

    expect(deleteActions.enqueue).toBeDefined();
    expect(deleteActions.request).toBeDefined();
    expect(deleteActions.success).toBeDefined();
    expect(deleteActions.failure).toBeDefined();
    expect(deleteActions.mistake).toBeDefined();
    expect(deleteActions.timeout).toBeDefined();
    expect(deleteActions.offline).toBeDefined();
  });

  it("generates ENQUEUE action with the correct shape for functions with no parameters", () => {
    const enqueue = getActions.enqueue([]);

    expect(enqueue).toMatchObject({ type: "GET_EXAMPLE_ENQUEUE", payload: [] });
  });

  it("generates ENQUEUE action with the correct shape for functions that require authentication", () => {
    const enqueue = deleteActions.enqueue([ExampleEntity]);

    expect(enqueue).toMatchObject({ type: "DELETE_EXAMPLE_ENQUEUE", payload: [ExampleEntity] });
  });

  it("generates REQUEST action with the correct shape", () => {
    const request = getActions.request([]);

    expect(request).toMatchObject({ type: "GET_EXAMPLE_REQUEST", payload: [] });
  });

  it("generates SUCCESS action with the correct shape", () => {
    const success: RFSA<"GET_EXAMPLE_SUCCESS", Readonly<typeof GetResponse>> = getActions.success(
      GetResponse,
    );

    expect(success).toMatchObject({ type: "GET_EXAMPLE_SUCCESS", payload: GetResponse });
  });

  it("generates FAILURE action with the correct shape", () => {
    const error = new Error("The server said no");
    const failure: RFSE<"GET_EXAMPLE_FAILURE", Error> = getActions.failure(error);

    expect(failure).toMatchObject({ type: "GET_EXAMPLE_FAILURE", error: true, payload: error });
  });

  it("generates MISTAKE action with the correct shape", () => {
    const error = new Error("You sent the wrong payload or weren't signed in");
    const mistake: RFSE<"GET_EXAMPLE_MISTAKE", Error> = getActions.mistake(error);

    expect(mistake).toMatchObject({ type: "GET_EXAMPLE_MISTAKE", error: true, payload: error });
  });

  it("generates TIMEOUT action with the correct shape", () => {
    const error = new Error("We waited and the server never responded");
    const timeout: RFSE<"GET_EXAMPLE_TIMEOUT", Error> = getActions.timeout(error);

    expect(timeout).toMatchObject({ type: "GET_EXAMPLE_TIMEOUT", error: true, payload: error });
  });

  it("generates OFFLINE action with the correct shape", () => {
    const error = new Error("You're offline, bud");
    const offline: RFSE<"GET_EXAMPLE_OFFLINE", Error> = getActions.offline(error);

    expect(offline).toMatchObject({ type: "GET_EXAMPLE_OFFLINE", error: true, payload: error });
  });

  it("generates actions containing at least one function argument", () => {
    const post: RFSA<"POST_EXAMPLE_REQUEST", [FruitQuantity]> = postActions.request([
      ExampleEntity,
    ]);

    expect(post).toMatchObject({
      type: "POST_EXAMPLE_REQUEST",
      payload: [ExampleEntity],
    });
  });

  it("generates actions containing multiple function arguments", () => {
    const request: RFSA<
      "DELETE_EXAMPLE_REQUEST",
      [boolean, FruitQuantity]
    > = deleteActions.request([true, ExampleEntity]);

    expect(request).toMatchObject({
      type: "DELETE_EXAMPLE_REQUEST",
      payload: [true, ExampleEntity],
    });
  });
});
