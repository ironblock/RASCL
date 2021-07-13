# Common Patterns

Most long-established patterns for UI interaction are handled in an easier, more consistent way through RASCL, since any given recipe's business logic can apply to any RASCL state object.

The following React-based recipes are functional examples of the state logic required to implement some of these common patterns, but they are by no means the best or only way to accomplish such tasks. In particular, classes may not be the optimal architecture in certain situations, and are preferred here only because they illustrate clearly the lifecycle and state data.

Many of these examples can also be trivially improved with memoized selectors.

- [Common Patterns](#common-patterns)
  - [Get last successful update](#get-last-successful-update)
  - [Get time of last successful update.](#get-time-of-last-successful-update)
    - [Compare the timestamps between different types of update](#compare-the-timestamps-between-different-types-of-update)
  - [Change UI based on a state update](#change-ui-based-on-a-state-update)
  - [Perform a side effect in response to a given action type](#perform-a-side-effect-in-response-to-a-given-action-type)

## Get last successful update

This one is as easy as possible. Anything `success` value in a RASCL state object is the most recent success.

```js
const getLastSuccess = (state) => state.success;
```

## Get time of last successful update.

This is slightly more complicated, and is a good use case for something like Reselect's memoization.

```js
const getLastSuccessTimestamp = (state) => (state.lastResult === "success" ? state.lastUpdate : 0);
```

### Compare the timestamps between different types of update

A commonly observed "flaw" in the shape of a RASCL state object is that we only know the time of the last update of **any** type, not itemized per type. So if the last result was a `success`, and we want to know the time of the last `success` we're in luck. But what if it was a `failure`?

In almost all cases, this is still enough state information, and trying to compare timestamps in a granular way is an antipattern. We can provide our UI with our cached `success` value so that the data persists regardless of the last result, and the correct business logic for "does the data need to be updated" should rely instead of how out of date the last update (of any kind) is, what the result of the last request was, or some other external factor (user loads a view, **n** seconds have passed, another request succeeded that stales this data, etc).

For instance, getting a `mistake` or `timeout` doesn't necessarily mean the data is stale, since the last `success` still remains whatever it was.

## Change UI based on a state update

Let's say you have an application that sends messages to cats you think are cute, and you use a modal window to send the message. Once the message is sent to your cat, the modal window should close.

In an application with non-globalized state, you would use a simple callback to accomplish this.

```tsx
import { connect } from "react-redux";

import type { StateShape } from "./your/reducer";
import actions from "./your/actions"

const mapDispatchToProps = (dispatch) => ({
  onSubmitMessage: message => dispatch(actions.messageCuteCat(message))
});

const mapStateToProps = (state: StateShape) => ({
  // See above for how to implement getLastSuccess
  lastSuccess: getLastSuccess(state.api.messageCuteCat)
});

class CloseModalExample {
  state = {
    modalOpened: 0
  };

  handleOpenModal = () => this.setState({ modalOpened: Date.now() })

  render() {
    return (
      <main>
        <h1>Message Some Cats!</h1>
        <button
          onClick={this.handleOpenModal}
        >
          Message a heckin' chonker
        </button>
        <ModalWindow
          {/*
            The timestamp for when the modal was opened can be compared to the
            timestamp of the last success - if it wasn't after the modal was
            opened, it was for some other purpose. If something else causes a
            message success action to be dispatched, we probably want to clean
            up anyways, so closing the modal is probably to our benefit.
          */}
          visible={this.state.modalOpened < this.props.lastSuccess}
          onSubmit={this.props.onSubmitMessage}
        />
      </main>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CloseModalExample);
```

## Perform a side effect in response to a given action type

One of the impacts of RASCL's decision to force all API-calling sagas to do **nothing** other than call the API is that there are no side effects in API calls. Users of `redux-saga` may have become accustomed to doing things like

```js
*function postNewCatSaga(action) {
  try {
    const response = yield call(postNewCat, action.payload);

    yield put(postNewCat.success(response));

    // If the request succeeded, get the welcome message for the new cat
    yield put(welcomeCat.request(response.id));
  } catch (error) {
    yield put(postNewCat.failure(response));
  } finally {
    // Always refresh cats because the server is flaky, sometimes a failure
    // still inserts the cat into the db and we don't know it won't
    yield put(getCats.request());
  }
}
```

**This is an antipattern.** Not only does it make debugging harder, it produces code whose side effects are tightly coupled to an **implicit** behavior rather than being a response to an **explicit** action.

This could be rewritten as:

```js
*function respondToPostNewCatRequest(action) {
  yield put(actions.getCats.request());
}

*function welcomeNewCatSaga(action) {
  const { id } = action.payload;

  yield put(actions.welcomeCat.request(id));
}

export const watchers = {
  *watchRespondToPostNewCatRequest(): {
    yield takeLatest(
      [
        actions.postNewCat.success,
        actions.postNewCat.failure
      ],
      respondToPostNewCatRequest
    );
  },
  *watchWelcomeNewCatSaga(): {
    yield takeLatest(
      actions.postNewCat.success,
      welcomeNewCatSaga
    );
  }
}
```

Once rewritten, the side effects have become explicit consequences of action dispatches, just like any other saga. These are easier to debug and test, and allows each saga to follow the [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single_responsibility_principle).

That being said, this is much more verbose, and makes it harder to follow something that's functionally just an async "if that then this". The RASCL [saga utilities](../src/utility/sagas.js) provide a convenience method that sugars over this pattern and creates the sagas dynamically:

```js
  // ...
  ...respondWithAction(
    "respondToPostNewCatRequest",
    [
      actions.postNewCat.success,
      actions.postNewCat.failure
    ],
    actions.getCats.request
  ),
  ...respondWithAction(
    "respondToPostNewCatRequest",
    actions.postNewCat.success,
    actions.welcomeCat.request
  ),
  // ...
```
