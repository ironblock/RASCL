import createRASCL from "../src";
import * as ExampleAPI from "./stubs/api";

describe("Action Type Constants", () => {
  it("creates action type constants for a given input", () => {
    const { actionTypes } = createRASCL(ExampleAPI);

    expect(actionTypes.getExample.request).toBe("GET_EXAMPLE_REQUEST");
    expect(actionTypes.getExample.success).toBe("GET_EXAMPLE_SUCCESS");
    expect(actionTypes.getExample.failure).toBe("GET_EXAMPLE_FAILURE");
    expect(actionTypes.getExample.mistake).toBe("GET_EXAMPLE_MISTAKE");
    expect(actionTypes.getExample.timeout).toBe("GET_EXAMPLE_TIMEOUT");
  });
});
