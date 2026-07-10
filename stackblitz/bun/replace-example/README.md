# SDuX Vault Bun Replace Example

A simple HTTP server demonstrating state replacement with SDuX Vault running on Bun.

## What This Example Shows

- **State Shape**: Simple `CounterState` with `count`, `label`, and `lastUpdate`
- **State Replacement**: Using `replaceState()` to update the entire state atomically
- **Deterministic Pipeline**: Commit state and await the next `state$` emission for a confirmed snapshot
- **Clear API Responses**: `GET /state` returns the current domain value, not the full snapshot wrapper
- **Server Integration**: Running SDuX Vault on Bun as a backend state manager

## The Queue Is the Architecture

State management in a server only works reliably when two conditions are met:

1. **A serializing queue** — every write enters a single ordered execution path
2. **A long-lived singleton** — the cell outlives any individual request

This server satisfies both. The `counter` cell is a module-level singleton created once at startup. Every `replaceState()` call enters the SDuX Vault conductor queue, which serializes all pipeline writes in FIFO order. The queue is the correctness mechanism — not the application code around it.

The point of these Bun examples is to demonstrate that SDuX Vault _can_ do server-side state management with the correct architecture. Most state libraries cannot, because they lack an explicit serialization boundary. SDuX Vault has one built in.

> **Community note**: If you want to take this further, move state derivation entirely into reducers so it runs under the queue's serialization guarantee. That closes the read-modify-write window that exists when application code reads `cell.state.value` before calling `replaceState()`. That's a great first contribution.

## Quick Start

```bash
bun install
bun start
```

Server starts at `http://localhost:3000`

## API Endpoints

### GET /state

Get the current counter value from `snapshot.value`

```bash
curl http://localhost:3000/state
```

Response:

```json
{
  "count": 0,
  "label": "Counter Example",
  "lastUpdate": "2026-07-09T12:34:56.789Z"
}
```

### POST /increment

Increment counter by 1

```bash
curl -X POST http://localhost:3000/increment
```

### POST /reset

Reset counter to 0

```bash
curl -X POST http://localhost:3000/reset
```

### POST /replace

Replace the counter state with a new value. `count` and `label` are required; `lastUpdate` is optional and will be generated if omitted.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"count": 42, "label": "Custom Count"}' \
  http://localhost:3000/replace
```

## How It Works

1. **Initialize**: `createCounterCell()` creates a FeatureCell with initial state
2. **Act**: Send a request that calls `replaceCounter()`
3. **Observe**: await the next `state$` emission to receive the committed snapshot
4. **Assert**: Return the committed state to the client

```typescript
async function replaceCounter(
  cell: FeatureCell<CounterState>,
  newState: { count: number; label: string; lastUpdate?: string }
): Promise<CounterState> {
  const nextEmission = waitForNextCounterState(cell);

  cell.replaceState({
    loading: false,
    error: null,
    value: {
      count: newState.count,
      label: newState.label,
      lastUpdate: newState.lastUpdate ?? new Date().toISOString()
    }
  });

  return nextEmission;
}
```

## Why Bun for SDuX Vault?

- **Zero Dependencies**: SDuX Vault runs in plain TypeScript with no runtime magic
- **Deterministic**: Pipeline execution guarantees → predictable server state
- **Fast Startup**: Bun's native TypeScript support means no build step
- **Reactive confirmation**: `state$` gives you an explicit observable signal when a committed snapshot is ready

## Development Mode

```bash
bun --watch src/main.ts
```

Server auto-restarts on file changes.

## Try It Live

In one terminal:

```bash
bun start
```

In another terminal:

```bash
# Get initial state
curl http://localhost:3000/state

# Increment a few times
curl -X POST http://localhost:3000/increment
curl -X POST http://localhost:3000/increment
curl http://localhost:3000/state

# Reset
curl -X POST http://localhost:3000/reset
curl http://localhost:3000/state
```
