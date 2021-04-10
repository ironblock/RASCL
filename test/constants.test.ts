import "jest";
import { createTypeConstants } from "../src/constants";
import * as ExampleAPI from "./stubs/api";

describe("Action Type Constants", () => {
  it("creates action type constants for a given input", () => {
    const actionTypes = createTypeConstants<typeof ExampleAPI, "getExample">("getExample");

    expect(actionTypes.request).toBe("GET_EXAMPLE_REQUEST");
    expect(actionTypes.success).toBe("GET_EXAMPLE_SUCCESS");
    expect(actionTypes.failure).toBe("GET_EXAMPLE_FAILURE");
    expect(actionTypes.mistake).toBe("GET_EXAMPLE_MISTAKE");
    expect(actionTypes.timeout).toBe("GET_EXAMPLE_TIMEOUT");
  });
});
