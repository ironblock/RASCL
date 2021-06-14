/**
 * @jest-environment jsdom
 */

import "jest";
import { testSaga } from "redux-saga-test-plan";

import { createRootSaga } from "../../src/sagas";

describe("Root Saga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a generator function", () => {
    const root = createRootSaga({});

    testSaga(root).next().finish();
  });
});
