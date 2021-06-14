/**
 * @jest-environment jsdom
 */

import "jest";

import createRASCL, { RASCL } from "../src/index";
import { initialEndpointState } from "../src/reducers";

const simpleAPI = {
  getThing: async () => await fetch("example.com"),
  postThing: async () => await fetch("example.com", { method: "post" }),
};

/**
 * NOTE: Most of the tests in this file are testing just the shapes and types
 * returned by createRASCL as a form of integration test. The actual interfaces
 * are unit tested in their respective files.
 */
describe("createRASCL", () => {
  let output: RASCL<typeof simpleAPI>;

  it("runs generation without errors", () => {
    output = createRASCL(simpleAPI);

    expect(output).toBeTruthy();
  });

  it("creates type constants", () => {
    expect(output.types.getThing.enqueue).toBe("GET_THING_ENQUEUE");
    expect(output.types.getThing.request).toBe("GET_THING_REQUEST");
    expect(output.types.getThing.success).toBe("GET_THING_SUCCESS");
    expect(output.types.getThing.failure).toBe("GET_THING_FAILURE");
    expect(output.types.getThing.mistake).toBe("GET_THING_MISTAKE");
    expect(output.types.getThing.timeout).toBe("GET_THING_TIMEOUT");
    expect(output.types.getThing.offline).toBe("GET_THING_OFFLINE");

    expect(output.types.postThing.enqueue).toBe("POST_THING_ENQUEUE");
    expect(output.types.postThing.request).toBe("POST_THING_REQUEST");
    expect(output.types.postThing.success).toBe("POST_THING_SUCCESS");
    expect(output.types.postThing.failure).toBe("POST_THING_FAILURE");
    expect(output.types.postThing.mistake).toBe("POST_THING_MISTAKE");
    expect(output.types.postThing.timeout).toBe("POST_THING_TIMEOUT");
    expect(output.types.postThing.offline).toBe("POST_THING_OFFLINE");
  });

  it("creates action creators", () => {
    expect(typeof output.actions.getThing.enqueue).toBe("function");
    expect(typeof output.actions.getThing.request).toBe("function");
    expect(typeof output.actions.getThing.success).toBe("function");
    expect(typeof output.actions.getThing.failure).toBe("function");
    expect(typeof output.actions.getThing.mistake).toBe("function");
    expect(typeof output.actions.getThing.timeout).toBe("function");
    expect(typeof output.actions.getThing.offline).toBe("function");

    expect(typeof output.actions.postThing.enqueue).toBe("function");
    expect(typeof output.actions.postThing.request).toBe("function");
    expect(typeof output.actions.postThing.success).toBe("function");
    expect(typeof output.actions.postThing.failure).toBe("function");
    expect(typeof output.actions.postThing.mistake).toBe("function");
    expect(typeof output.actions.postThing.timeout).toBe("function");
    expect(typeof output.actions.postThing.offline).toBe("function");
  });

  it("creates initial state for a reducer", () => {
    expect(output.initialState).toEqual({
      getThing: initialEndpointState,
      postThing: initialEndpointState,
    });
  });

  it("creates DEFAULT watcher sagas", () => {
    expect(typeof output.watchers.getThing).toBe("function");

    expect(typeof output.watchers.postThing).toBe("function");
  });

  it("creates a reducer", () => {
    expect(typeof output.reducer).toBe("function");
  });

  it("creates a root saga", () => {
    expect(typeof output.rootSaga).toBe("function");
  });
});
