import { FeatureCell } from '@sdux-vault/core';
import { firstValueFrom } from 'rxjs';
import { skip } from 'rxjs/operators';

/**
 * Defines the domain state managed by the counter FeatureCell.
 * Every field is replaced atomically on each pipeline commit, so readers
 * always see a fully consistent snapshot.
 */
interface CounterState {
  count: number;
  label: string;
  lastUpdate: string;
}

/**
 * Describes the payload accepted by POST /replace. All fields except
 * `lastUpdate` are required so the server can perform a full state
 * replacement rather than a partial merge.
 */
interface ReplaceCounterInput {
  count: number;
  label: string;
  lastUpdate?: string;
}

/**
 * Narrows the shape of each emission from `state$` to the fields this
 * example reads. The `snapshot.value` property holds the fully committed
 * domain value after the pipeline has finished processing.
 */
interface CounterStateEmit {
  snapshot: {
    value: CounterState | undefined;
  };
}

/**
 * Convenience alias for the return type of `createCounterCell`. Lets
 * helper functions accept the live cell instance without importing a
 * separate type.
 */
type CounterCell = ReturnType<typeof createCounterCell>;

/**
 * Builds a complete `CounterState` from a `ReplaceCounterInput`, filling in
 * `lastUpdate` with the current timestamp when the caller omits it. This
 * keeps timestamp generation outside the reducer so reducers remain pure.
 *
 * @param nextState - The incoming replacement payload.
 * @returns A fully populated `CounterState` ready to pass to `replaceState`.
 */
function normalizeCounterState(nextState: ReplaceCounterInput): CounterState {
  return {
    count: nextState.count,
    label: nextState.label,
    lastUpdate: nextState.lastUpdate ?? new Date().toISOString()
  };
}

/**
 * Reads the current committed counter value from the FeatureCell snapshot.
 * Falls back to a zeroed default when the cell has not yet received a commit,
 * ensuring callers always have a valid object to work with.
 *
 * @param cell - The live counter FeatureCell instance.
 * @returns The current `CounterState`, or a zeroed default if no commit exists.
 */
function getCounterValue(cell: CounterCell): CounterState {
  return (
    cell.state.value ?? {
      count: 0,
      label: 'Counter Example',
      lastUpdate: new Date().toISOString()
    }
  );
}

/**
 * Subscribes to `state$` and resolves with the next committed snapshot.
 * Calling code registers this listener before issuing a `replaceState` so
 * the resulting emission is guaranteed to correspond to that specific write.
 *
 * @param cell - The live counter FeatureCell instance.
 * @returns A promise that resolves with the next committed `CounterState`.
 */
async function waitForNextCounterState(
  cell: CounterCell
): Promise<CounterState> {
  const emit = await firstValueFrom<CounterStateEmit>(
    cell.state$.pipe(skip(1))
  );
  return emit.snapshot.value as CounterState;
}

/**
 * Creates the counter FeatureCell and initializes it with a starting state.
 * The cell is a module-level singleton; every HTTP request operates against
 * the same instance, and the SDuX Vault conductor queue serializes all writes.
 *
 * @returns The initialized counter FeatureCell instance.
 */
function createCounterCell() {
  const cell = FeatureCell<CounterState>({
    key: 'counter',
    initialState: {
      count: 0,
      label: 'Counter Example',
      lastUpdate: new Date().toISOString()
    }
  });

  cell.initialize();

  return cell;
}

/**
 * Performs a full state replacement on the counter FeatureCell and returns
 * the committed result. The listener for the next `state$` emission is
 * registered before `replaceState` is called so the promise resolves with
 * exactly the snapshot produced by this write.
 *
 * @param cell - The live counter FeatureCell instance.
 * @param newState - The replacement payload containing the new counter values.
 * @returns A promise that resolves with the committed `CounterState`.
 */
export async function replaceCounter(
  cell: CounterCell,
  newState: ReplaceCounterInput
): Promise<CounterState> {
  const nextEmission = waitForNextCounterState(cell);

  cell.replaceState({
    loading: false,
    error: null,
    value: normalizeCounterState(newState)
  });

  return nextEmission;
}

/**
 * Increments the counter by one and commits the replacement through the
 * pipeline. The current label is preserved so only the count field changes.
 *
 * @param cell - The live counter FeatureCell instance.
 * @returns A promise that resolves with the committed `CounterState`.
 */
export async function incrementCounter(
  cell: CounterCell
): Promise<CounterState> {
  const current = getCounterValue(cell);
  return replaceCounter(cell, {
    count: current.count + 1,
    label: current.label,
    lastUpdate: new Date().toISOString()
  });
}

/**
 * Resets the counter to zero and relabels it, committing a full replacement
 * through the pipeline. Any previous label or count is discarded.
 *
 * @param cell - The live counter FeatureCell instance.
 * @returns A promise that resolves with the committed `CounterState`.
 */
export async function resetCounter(cell: CounterCell): Promise<CounterState> {
  return replaceCounter(cell, {
    count: 0,
    label: 'Counter Reset',
    lastUpdate: new Date().toISOString()
  });
}

/**
 * Re-exports the factory so the server module can create the singleton cell
 * without importing internal helpers directly.
 */
export { createCounterCell };
