import createRASCL from "../src";
import * as ExampleAPI from "./stubs/api";

describe("Action Type Constants", () => {
  it("creates action type constants for a given input", () => {
    const { actionTypes } = createRASCL(ExampleAPI);

    expect(actionTypes.deleteExample.request).toBe("DELETEEXAMPLE_REQUEST");
    expect(actionTypes.deleteExample.success).toBe("DELETEEXAMPLE_SUCCESS");
    expect(actionTypes.deleteExample.failure).toBe("DELETEEXAMPLE_FAILURE");
    expect(actionTypes.deleteExample.mistake).toBe("DELETEEXAMPLE_MISTAKE");
    expect(actionTypes.deleteExample.timeout).toBe("DELETEEXAMPLE_TIMEOUT");
    actionTypes.deleteExample.failure;
  });
});
