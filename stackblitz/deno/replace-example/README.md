# SDuX Vault Deno Replace Example

A script demonstrating atomic full-state replacement with SDuX Vault in plain
TypeScript running directly in Deno. Dependencies use Deno's `npm:` specifiers,
so no Node.js package manifest, npm installation, or TypeScript runner is needed.

## What This Example Shows

- **State Shape**: Simple `CounterState` with `count`, `label`, and `lastUpdate`
- **State Replacement**: Using `replaceState()` to atomically swap the entire
  state in one pipeline write
- **Awaited Confirmation**: Registering a `state$` listener _before_ calling
  `replaceState()` so the script awaits the committed snapshot — not the raw input
- **Class-Based Runner**: All methods and the FeatureCell live on a single class
  so every `await` has a proper `async` context — no top-level await, no
  frameworks, no HTTP server, just plain TypeScript

## This Is Not Production Code

This example is intentionally minimal. Its job is to show that SDuX Vault works
directly in Deno — nothing more. The patterns here are a starting point. Take
what applies to your use case and build from there.

> The runner calls `Deno.exit(0)` after completion because an open RxJS
> subscription can otherwise keep the event loop alive.

## Prerequisites

- Deno 2 or later

## Quick Start

```bash
deno run src/main.ts
```

## Expected Output

```
=== SDuX Vault Deno Replace Example ===

[CELL] Counter cell created
[STATE] Initial: count=0, label="Counter Example"

[ACTION] Incrementing counter...
[STATE]  count=1, label="Counter Example"

[ACTION] Incrementing counter...
[STATE]  count=2, label="Counter Example"

[ACTION] Incrementing counter...
[STATE]  count=3, label="Counter Example"

[ACTION] Replacing with custom state: count=42, label="My Custom Count"
[STATE]  count=42, label="My Custom Count"

[ACTION] Incrementing counter...
[STATE]  count=43, label="My Custom Count"

[ACTION] Resetting counter to zero...
[STATE]  count=0, label="Counter Reset"

=== Done ===
```

## How It Works

1. **Create**: `FeatureCell()` builds the state container; `initialize()` is
   called in the constructor to start the pipeline.
2. **Await Initial State**: `initialize()` queues the initialState commit in the
   microtask queue. A `setTimeout(0)` tick yields to the event loop so the queue
   flushes and `state.value` is populated before the initial log.
3. **Listen**: Before every `replaceState()` write, `#waitForNextState()` registers
   a `firstValueFrom(state$.pipe(skip(1)))` listener. `skip(1)` discards the
   BehaviorSubject's current value so the promise resolves only with the next
   real emission.
4. **Write**: `replaceState()` sends the new value through the pipeline.
5. **Confirm**: The awaited promise resolves with the committed snapshot.

```typescript
class ReplaceExample {
  #cell = FeatureCell<CounterState>({
    key: 'counter',
    initialState: { count: 0, label: 'Counter Example', ... }
  });

  constructor() {
    this.#cell.initialize();
  }

  async run(): Promise<void> {
    // setTimeout(0) lets the microtask queue flush so initialState is committed
    await new Promise((resolve) => setTimeout(resolve, 0));
    console.log(`count=${this.#cell.state.value?.count}`);

    // Each write registers the listener first, then commits
    const next = await this.#replaceCounter(42, 'My Custom Count');
  }

  async #replaceCounter(count: number, label: string): Promise<CounterState> {
    const nextEmission = this.#waitForNextState(); // register first
    this.#cell.replaceState({ loading: false, error: null, value: { count, label, ... } });
    return nextEmission; // resolves with the confirmed committed state
  }
}
```

## Why Deno for SDuX Vault?

SDuX Vault is a plain TypeScript library with no browser dependencies. The same
`FeatureCell` API that manages UI state in Angular, React, Vue, or Svelte works
runs directly in Deno through `npm:@sdux-vault/core`. The conductor queue
serializes writes, so the correctness guarantees remain the same.
