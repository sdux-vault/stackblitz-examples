# SDuX Vault Bun Promise Example

A server demonstrating async promise resolution with deterministic pipeline execution using SDuX Vault on Bun.

## What This Example Shows

- **Async State Management**: Loading data from async APIs
- **Deterministic Async**: Each write awaits the next committed `state$` emission
- **Error Handling**: Graceful error handling with state updates
- **Pure State Derivation**: A pure reducer recomputes derived totals after each committed snapshot
- **Concurrent Loading**: Load multiple users in parallel, state settles predictably

## The Queue Is the Architecture

State management in a server only works reliably when two conditions are met:

1. **A serializing queue** — every write enters a single ordered execution path
2. **A long-lived singleton** — the cell outlives any individual request

This server satisfies both. The `usersCell` is a module-level singleton created once at startup. Every `replaceState()` call enters the SDuX Vault conductor queue, which serializes all pipeline writes in FIFO order. The queue is the correctness mechanism — not the application code around it.

Async state management is hard in any system because promises introduce concurrency gaps. The SDuX pipeline handles async inputs natively by resolving them inside the queue boundary. This example demonstrates how to work _with_ that model: commit state, await the resulting `state$` emission, then proceed.

> **Community note**: If you want to take this further, move state derivation entirely into reducers so it runs under the queue's serialization guarantee. That closes the read-modify-write window that exists when application code reads `cell.state.value` before calling `replaceState()`. That's a great first contribution.

## Quick Start

```bash
bun install
bun start
```

Server starts at `http://localhost:3000`

## API Endpoints

### GET /state

Get the current users domain value from `snapshot.value` (including loading status for each user)

```bash
curl http://localhost:3000/state
```

Response:

```json
{
  "users": [
    {
      "id": 1,
      "name": "User 1",
      "email": "user1@example.com",
      "status": "loaded"
    }
  ],
  "totalLoaded": 1,
  "lastRefresh": "2026-07-09T12:34:56.789Z"
}
```

### POST /load/:id

Load a single user by ID (simulates 500-1000ms API delay)

```bash
# Load user 1
curl -X POST http://localhost:3000/load/1

# Check state again
curl http://localhost:3000/state
```

User progresses through states:

1. `loading` — added to collection
2. `loaded` — data received from API
3. `error` — if API fails (e.g., user ID 999)

### POST /load-batch

Load multiple users concurrently. The request body must include `userIds` as an array of positive integers. Duplicate IDs are deduplicated in first-seen order.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"userIds": [1, 2, 3, 4, 5]}' \
  http://localhost:3000/load-batch
```

All users load in parallel, but the batch path first commits one loading snapshot so every requested user is visible before the async work resolves. After each committed emission, the pure reducer recomputes:

1. Count of loaded users

### POST /clear

Clear all users

```bash
curl -X POST http://localhost:3000/clear
```

## How It Works

### The Commit → Emission Pattern for Async

```typescript
async function loadUser(
  cell: FeatureCell<UsersState>,
  userId: number
): Promise<UsersState> {
  await commitUsersState(cell, {
    ...getUsersValue(cell),
    users: [...getUsersValue(cell).users, { id: userId, status: 'loading' }]
  });

  try {
    const userData = await loadUserFromAPI(userId);

    return commitUsersState(cell, {
      ...getUsersValue(cell),
      users: getUsersValue(cell).users.map((u) =>
        u.id === userId ? { ...u, ...userData } : u
      )
    });
  } catch (error) {
    return commitUsersState(cell, {
      ...getUsersValue(cell),
      users: getUsersValue(cell).users.map((u) =>
        u.id === userId
          ? { ...u, status: 'error', errorMessage: String(error) }
          : u
      )
    });
  }
}
```

### Reducer Composition

The example keeps reducers pure by deriving totals only:

```typescript
cell.reducers([
  // Reducer 1: Count loaded users
  (current) => ({
    ...current,
    totalLoaded: current.users.filter((u) => u.status === 'loaded').length
  })
]);
```

`lastRefresh` is stamped in the request helper before each `replaceState()` call so the reducer stays side-effect free.

## Why This Pattern Works

1. **Async waits for committed emissions**: each update awaits the next `state$` emission before continuing
2. **Reducers stay pure**: Derived totals come from the committed collection, while timestamps are stamped before pipeline entry
3. **Deterministic outcome**: Same sequence of API calls always produces the same final state
4. **No lost updates**: Concurrent user loads merge against the latest committed collection so parallel requests keep every user
5. **Visible batch startup**: Batch requests commit one loading snapshot before parallel API work begins
6. **Duplicate-safe batches**: Repeated IDs do not trigger redundant loads or duplicate records in state

## Try It Live

Terminal 1:

```bash
bun start
```

Terminal 2:

```bash
# Initial state
curl http://localhost:3000/state

# Load one user
curl -X POST http://localhost:3000/load/1

# Check state — user is now loaded, totalLoaded=1
curl http://localhost:3000/state

# Load batch of users
curl -X POST -H "Content-Type: application/json" \
  -d '{"userIds": [2, 3, 4]}' \
  http://localhost:3000/load-batch

# All loaded, state is deterministic
curl http://localhost:3000/state

# Test error handling (user 999 will fail)
curl -X POST http://localhost:3000/load/999

# State shows error with message
curl http://localhost:3000/state

# Clear and start over
curl -X POST http://localhost:3000/clear
curl http://localhost:3000/state
```

## The Queue Is the Architecture

State management in a server only works reliably when two conditions are met:

1. **A serializing queue** — every write enters a single ordered execution path
2. **A long-lived singleton** — the cell outlives any individual request

This server satisfies both. The `usersCell` is a module-level singleton created once at startup. Every `replaceState()` call enters the SDuX Vault conductor queue, which serializes all pipeline writes in FIFO order. The queue is the correctness mechanism — not the application code around it.

Async state management is hard in any system because promises introduce concurrency gaps. The SDuX pipeline handles async inputs natively by resolving them inside the queue boundary. This example demonstrates how to work _with_ that model: commit state, await the resulting `state$` emission, then proceed.

> **Community note**: If you want to take this further, move state derivation entirely into reducers so it runs under the queue's serialization guarantee. That closes the read-modify-write window that exists when application code reads `cell.state.value` before calling `replaceState()`. That's a great first contribution.

## Development Mode

```bash
bun --watch src/main.ts
```

Server auto-restarts on file changes.
