# Motivation

Redux is fundamentally a way to globalize state. This flexability is extremely helpful when implementing complex and unique data models for an application, but having "complex" and "unique" API interactions can complicate and slow down development, especially on larger teams.

A common problem with storing API responses in Redux is that - given enough developers - different people will duplicate or extend Redux boilerplate according to their current focus. It often seems efficient or "cleaner" to store only a small portion of a response, knowing or assuming that the remainder is (currently) unused.

## Strawman Example

Let's imagine that Alice and Bryce are working on a new application against an existing API.

> Alice starts a feature _"As a user, I should see my first name in the account menu"_. She looks at the API documentation, and sees that `GET /user/profile` returns an object containing `{ firstName: string }`. She creates an entry in the state tree for `reducers/user.js`, storing `firstName` so that it's accessible as `state.user.firstName`

In the real world, it's hardly likely that a user's first name is the only data from `/user/profile` this application will care about, but it serves as a useful framing device for considering what fields in a larger response body might be omitted or ignored - maybe the user profile contains a large array of that user's recent events, and this application doesn't currently use them.

> Next, Bryce starts a feature _"As a user, I should see my profile picture in the account menu"_. The image URL is contained in the same `GET user/profile` response, but now Bryce has to understand and discover all of the decisions and data muxing done by Alice. If they misunderstand Alice's intent, or overlook her implementation entirely, the outcome may be a duplication of effort, or create multiple handlers for the same API call.

> Worse still, if Alice created Redux actions and reducers around a action type of `UPDATE_USER_FIRST_NAME`, Bryce may have no choice but to either create more boilerplate for `UPDATE_USER_PROFILE_IMAGE`, or refactor the existing code to `UPDATE_USER_PROFILE`.

The first option matches the existing pattern, but worsens the technical debt, and doesn't address the fundamental problem.

The second option addresses the technical debt, but may introduce unexpected behavior or take longer to implement because Bryce has to find every place the old code was in use and update it for the new data model and action name.
