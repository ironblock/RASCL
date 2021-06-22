
### Starting Conditions
<dl>
  <dt>
    <img src="https://via.placeholder.com/10/888/000000?text=+" />
    <code>INITIAL</code>
  </dt>
  <dd>This is the starting state for all endpoints. An endpoint at `INITIAL` has not been used. No API calls have been made, no actions have been dispatched, and all data fields will still be <code>null</code>.</dd>
</dl>

---

### Making Requests
<dl>
  <dt>
    <img src="https://via.placeholder.com/10/2b6a96/000000?text=+" /> 
    <code>ENQUEUE</code> (Optional)
  </dt>
  <dd>The optional <code>ENQUEUE</code> state allows for common utility patterns. An "offline-first" webapp may want to allow enqueueing multiple requests while offline, or a modal login window may be rendered over the application, which has UI logic that makes API calls as soon as possible after rendering. In either case, <code>ENQUEUE</code> allows a developer to create preconditions for certain calls, for instance to say "only make this call once the device is online and the user has valid credentials".</dd>

  <dt>
  <img src="https://via.placeholder.com/10/2b6a96/000000?text=+" /> <code>REQUEST</code></dt>
  <dd>An endpoint is set to the `REQUEST` state after the API request has been made, but before any response has come back. This will set `isFetching: true`, which is useful for triggering spinners or blocking user actions while awaiting data.</dd>
</dl>

---

### Handling Data
<dl>
  <dt>
  <img src="https://via.placeholder.com/10/199e49/000000?text=+" /> <code>SUCCESS</code></dt>
  <dd>Indicates a <code>2XX</code> response from the API. May or may not include a body.</dd>
</dl>

---

### Recovering From Errors
<dl>
  <dt>
  <img src="https://via.placeholder.com/10/d22026/000000?text=+" /> <code>FAILURE</code></dt>
  <dd>Usually indicates a <code>4XX</code> response from the API.</dd>
  <dt>
  <img src="https://via.placeholder.com/10/d22026/000000?text=+" /> <code>MISTAKE</code></dt>
  <dd>Indicates a <code>5XX</code> response from the API.</dd>
</dl>

---

### Resolving Warnings
<dl>
  <dt>
  <img src="https://via.placeholder.com/10/f58420/000000?text=+" /> <code>OFFLINE</code></dt>
  <dd>Indicates that the device is offline, or otherwise has no internet connection.
  <dt>
  <img src="https://via.placeholder.com/10/f58420/000000?text=+" /> <code>TIMEOUT</code></dt>
  <dd>Indicates that the request was sent, but that the response didn't arrive in a specific timeframe.</dd>
</dl>