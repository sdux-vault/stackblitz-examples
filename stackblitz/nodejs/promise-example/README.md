# SDuX Vault TypeScript Promise Example

A script demonstrating async promise resolution with SDuX Vault in plain
TypeScript. It uses only runtime-neutral APIs, so the same file runs in Node,
Bun, Deno, or the browser — this folder runs it with Node via `tsx`.

## What This Example Shows

- **Two-Step Async Commit**: Committing a `loading` placeholder before an async
  operation begins, then committing the `loaded` or `error` result when it settles
- **Reducers**: A pure reducer that recomputes `totalLoaded` after every pipeline
  commit — derived state stays consistent without manual counting in call sites
- **Concurrent Loading**: Batch-loading multiple users by committing all
  placeholders in a single write before dispatching parallel fetches
- **Error State**: User ID 999 always rejects, demonstrating that error entries
  are committed to state without disrupting the rest of the collection

## This Is Not Production Code

This example is intentionally minimal. Its job is to show that SDuX Vault handles
async promise resolution in plain TypeScript — nothing more. Adapt the
patterns to your own data-fetching use case and build from there.

> The runner guards `process.exit(0)` with a `typeof process` check so the
> script exits cleanly under Node (an open RxJS subscription can otherwise keep
> the event loop alive) while remaining a no-op in non-Node runtimes.

## Prerequisites

- Node.js 18 or later
- npm

## Quick Start

```bash
npm install
npm start
```

## Expected Output

```
=== SDuX Vault Node.js Promise Example ===

[CELL] Users cell created with reducer (counts loaded users)
[STATE] Initial: 0 users

[ACTION] Loading user 1...
[STATE]  user 1: loaded → name: User 1, email: user1@example.com
[STATE]  totalLoaded (from reducer): 1

[ACTION] Loading users 2 and 3 concurrently...
[STATE]  user 2: loaded → User 2
[STATE]  user 3: loaded → User 3
[STATE]  totalLoaded (from reducer): 3

[ACTION] Loading user 999 (will error)...
[ERROR]  user 999: error → Error: User 999 not found
[STATE]  loaded users still in state: user 1, user 2, user 3

[ACTION] Clearing all users...
[STATE]  0 users, totalLoaded: 0

=== Done ===
```

> Timing varies slightly between runs due to the simulated random delay in
> `fetchUser()`. The order of users 2 and 3 in the output may also vary
> depending on which fetch resolves first.

## How It Works

1. **Create**: `FeatureCell()` with a `reducers()` call registers the derived
   field computation. `initialize()` is called in the constructor to start the
   pipeline.
2. **Await Initial State**: `initialize()` queues the initialState commit in the
   microtask queue. A `setTimeout(0)` tick yields to the event loop so the queue
   flushes and `state.value` is populated before the initial log.
3. **Placeholder First**: A `loading` entry is committed to state before `fetch`
   starts, so the entry is visible immediately.
4. **Settle**: When the promise resolves or rejects, a second commit captures the
   final `loaded` or `error` status.
5. **Reducer Runs**: After each commit the registered reducer recomputes
   `totalLoaded` from the current collection — no manual counting.

```typescript
class PromiseExample {
  #cell = FeatureCell<UsersState>({ key: 'users', initialState: { users: [], ... } });

  constructor() {
    this.#cell.reducers([
      (current) => ({ ...current, totalLoaded: current.users.filter(u => u.status === 'loaded').length })
    ]).initialize();
  }

  async run(): Promise<void> {
    // setTimeout(0) lets the microtask queue flush so initialState is committed
    await new Promise((resolve) => setTimeout(resolve, 0));
    console.info(`${this.#getUsersValue().users.length} users`);

    // Placeholder committed before async work begins
    await this.#commitUsersState({
      ...current,
      users: this.#upsertUser(current.users, this.#createLoadingUser(userId))
    });

    // Resolved value committed after the promise settles
    const userData = await this.#fetchUser(userId);
    return this.#commitUsersState({
      ...this.#getUsersValue(),
      users: this.#upsertUser(this.#getUsersValue().users, userData)
    });
  }
}
```

## Why Node.js for SDuX Vault?

SDuX Vault is a plain TypeScript library with no browser dependencies. The same
`FeatureCell` API that manages async state in Angular, React, Vue, or Svelte
works identically here — no adaptation needed. The conductor queue serializes
writes in both environments, so concurrent commits are safe without any extra
locking logic.
