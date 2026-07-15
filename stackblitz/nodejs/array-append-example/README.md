# SDuX Vault TypeScript Array Append Example

A script demonstrating array append merge behavior with SDuX Vault in plain
TypeScript. It uses only runtime-neutral APIs, so the same file runs in Node,
Bun, Deno, or the browser — this folder runs it with Node via `tsx`.

## What This Example Shows

- **`withArrayAppendMergeBehavior`**: A definition-time add-on behavior from
  `@sdux-vault/addons` that changes how `mergeState()` writes land in the
  pipeline — each call concatenates the incoming array with the existing state
  rather than replacing it
- **Behaviors as Pipeline Configuration**: Registering a behavior at
  `FeatureCell()` creation time and seeing its effect on every subsequent write
- **`initialState` Seeding**: Starting the cell with pre-populated state so the
  first `initialize()` call produces a non-empty committed snapshot
- **`reset()`**: Clearing state to `undefined` without destroying the cell or
  its pipeline configuration

## This Is Not Production Code

This example is intentionally minimal. Its job is to show that SDuX Vault's
add-on behaviors work in plain TypeScript — nothing more. Take the
pattern, wire it to your own data model, and build from there.

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
=== SDuX Vault Node.js Array Append Example ===

[CELL] Examples cell created with initialState + withArrayAppendMergeBehavior
[STATE] Initial: [Darth Vader]

[ACTION] Merging [Luke Skywalker]...
[STATE]  [Darth Vader, Luke Skywalker]

[ACTION] Merging [Han Solo, Leia Organa]...
[STATE]  [Darth Vader, Luke Skywalker, Han Solo, Leia Organa]

[ACTION] Resetting state...
[STATE]  undefined (state cleared, cell pipeline intact)

=== Done ===
```

## How It Works

1. **Initialize Vault**: `Vault()` must be called before `FeatureCell()` when
   using behaviors from `@sdux-vault/addons`.
2. **Register the Behavior**: `withArrayAppendMergeBehavior` is passed in the
   behaviors array at `FeatureCell()` creation. It configures the merge stage
   of the pipeline once — all subsequent `mergeState()` calls use it.
3. **Seed State**: `initialState` in the descriptor seeds the committed value
   when `initialize()` is called. The commit is queued in the microtask queue,
   not applied synchronously. A `setTimeout(0)` tick yields to the event loop
   so the queue flushes and `state.value` is populated before the initial log.
4. **Await Merge Emissions**: Each `mergeState()` result is read by awaiting the
   next `state$` emission via `firstValueFrom(state$.pipe(skip(1)))`. `skip(1)`
   discards the BehaviorSubject's current value so the promise resolves only
   when the merge write lands.
5. **Append**: Each `mergeState()` call adds to the existing array rather than
   replacing it. Previous entries are never lost.

```typescript
class ArrayAppendExample {
  #cell = FeatureCell<Example[]>(
    {
      key: 'examples',
      initialState: [{ id: 66, name: 'Darth', lastName: 'Vader' }]
    },
    [withArrayAppendMergeBehavior], // append semantics registered once here
    []
  );

  constructor() {
    // Starts the pipeline — initialState commit is queued in the microtask queue
    this.#cell.initialize();
  }

  async run(): Promise<void> {
    // setTimeout(0) lets the microtask queue flush so initialState is committed
    await new Promise((resolve) => setTimeout(resolve, 0));
    console.info(this.#cell.state.value?.map(label).join(', '));
    // [Darth Vader]

    // Each mergeState() concatenates — it does not replace
    const after = await this.#mergeExamples([
      { id: 1, name: 'Luke', lastName: 'Skywalker' }
    ]);
    // after: [Darth Vader, Luke Skywalker]
  }
}
```

## Why Node.js for SDuX Vault?

SDuX Vault is a plain TypeScript library with no browser dependencies. Add-on
behaviors from `@sdux-vault/addons` work identically in Node — the same behavior
registered in an Angular or Svelte app configures the pipeline the same way here.
