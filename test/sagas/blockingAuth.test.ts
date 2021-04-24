/**
 * @jest-environment jsdom
 */

import "jest";
import { expectSaga } from "redux-saga-test-plan";
import { select, take } from "redux-saga/effects";

import { requireAuth } from "../../src/sagas";

const LoginSuccess = { type: "LOGIN_SUCCESS" };

describe("Blocking Authentication Requirements", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("blocks indefinitely when not authenticated", async () => {
    const authenticated = false;
    const getAuthenticated = (): boolean => authenticated;

    await expectSaga(requireAuth, "LOGIN_SUCCESS", getAuthenticated)
      .provide([[select(getAuthenticated), false]])

      .provide([[take("LOGIN_SUCCESS"), LoginSuccess]])
      .provide([[select(getAuthenticated), false]])

      .provide([[take("LOGIN_SUCCESS"), LoginSuccess]])
      .provide([[select(getAuthenticated), false]])

      .silentRun();
  });

  it("returns without looping when already authenticated", async () => {
    const authenticated = true;
    const getAuthenticated = (): boolean => authenticated;

    await expectSaga(() => requireAuth("LOGIN_SUCCESS", getAuthenticated))
      .provide([[take("LOGIN_SUCCESS"), LoginSuccess]])
      .provide([[select(getAuthenticated), true]])

      .returns(true)

      .run();
  });

  it("returns after looping when finally authenticated", async () => {
    const authenticated = false;
    const getAuthenticated = (): boolean => authenticated;

    await expectSaga(requireAuth, "LOGIN_SUCCESS", getAuthenticated)
      .provide([[select(getAuthenticated), false]])

      .provide([[take("LOGIN_SUCCESS"), LoginSuccess]])
      .provide([[select(getAuthenticated), false]])

      .provide([[take("LOGIN_SUCCESS"), LoginSuccess]])
      .provide([[select(getAuthenticated), true]])

      .returns(true)

      .run();
  });
});
