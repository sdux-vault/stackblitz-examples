import { FeatureCell } from '@sdux-vault/core';
import { firstValueFrom } from 'rxjs';
import { skip } from 'rxjs/operators';

/**
 * Represents a single user entry in the collection. The `status` field
 * tracks the user through the async loading lifecycle so the UI — or in
 * this case the HTTP client — can observe progress at each committed stage.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  status: 'loading' | 'loaded' | 'error';
  errorMessage?: string;
}

/**
 * Defines the domain state managed by the users FeatureCell. The collection
 * holds all loaded users while `totalLoaded` and `lastRefresh` are derived
 * values recomputed by the reducer after each committed snapshot.
 */
export interface UsersState {
  users: User[];
  totalLoaded: number;
  lastRefresh: string;
}

/**
 * Narrows the shape of each emission from `state$` to the fields this
 * example reads. The `snapshot.value` property holds the fully committed
 * domain value after the pipeline has finished processing.
 */
interface UsersStateEmit {
  snapshot: {
    value: UsersState | undefined;
  };
}

/**
 * Convenience alias for the return type of `createUsersCell`. Lets helper
 * functions accept the live cell instance without importing a separate type.
 */
type UsersCell = ReturnType<typeof createUsersCell>;

/**
 * Constructs a placeholder `User` entry in the `loading` status. This record
 * is committed to state before the async API call begins so observers see the
 * user appear immediately rather than only after the network round-trip.
 *
 * @param userId - The numeric ID of the user being loaded.
 * @returns A `User` object with `status: 'loading'` and an empty email.
 */
function createLoadingUser(userId: number): User {
  return {
    id: userId,
    name: `User ${userId}`,
    email: '',
    status: 'loading'
  };
}

/**
 * Performs an immutable insert-or-replace of a user in the collection.
 * Matching is done by `id`; if no entry exists the user is appended.
 * This ensures concurrent writes each read the latest committed array
 * and apply their update without losing entries added by other requests.
 *
 * @param users - The current committed users array.
 * @param nextUser - The user record to insert or replace.
 * @returns A new array with the user inserted or updated in place.
 */
function upsertUser(users: User[], nextUser: User): User[] {
  const userIndex = users.findIndex((user) => user.id === nextUser.id);

  if (userIndex === -1) {
    return [...users, nextUser];
  }

  return users.map((user) => (user.id === nextUser.id ? nextUser : user));
}

/**
 * Removes duplicate IDs from a batch request in first-seen order. Calling
 * this before dispatching parallel loads prevents the same user from being
 * fetched twice and appearing as duplicate entries in state.
 *
 * @param userIds - The raw array of user IDs from the HTTP request body.
 * @returns A deduplicated array of user IDs preserving original order.
 */
function uniqueUserIds(userIds: number[]): number[] {
  return [...new Set(userIds)];
}

/**
 * Applies a fresh `lastRefresh` timestamp to the next state before it enters
 * the pipeline. Stamping happens here rather than inside a reducer so that
 * reducers stay pure and operate only on already-committed domain values.
 *
 * @param nextState - The state object to stamp.
 * @returns A copy of `nextState` with `lastRefresh` set to the current time.
 */
function stampUsersState(nextState: UsersState): UsersState {
  return {
    ...nextState,
    lastRefresh: new Date().toISOString()
  };
}

/**
 * Reads the current committed users state from the FeatureCell snapshot.
 * Falls back to an empty collection when the cell has not yet received a
 * commit, ensuring callers always receive a valid `UsersState` object.
 *
 * @param cell - The live users FeatureCell instance.
 * @returns The current `UsersState`, or an empty default if no commit exists.
 */
function getUsersValue(cell: UsersCell): UsersState {
  return (
    cell.state.value ?? {
      users: [],
      totalLoaded: 0,
      lastRefresh: new Date().toISOString()
    }
  );
}

/**
 * Subscribes to `state$` and resolves with the next committed snapshot.
 * Calling code registers this listener before issuing a `replaceState` so
 * the resulting emission corresponds to that specific write.
 *
 * @param cell - The live users FeatureCell instance.
 * @returns A promise that resolves with the next committed `UsersState`.
 */
async function waitForNextUsersState(cell: UsersCell): Promise<UsersState> {
  const emit = await firstValueFrom<UsersStateEmit>(cell.state$.pipe(skip(1)));
  return emit.snapshot.value as UsersState;
}

/**
 * Stamps the next state, submits it to the FeatureCell via `replaceState`,
 * and awaits the resulting committed emission. This is the canonical write
 * boundary in the example: every state change goes through this helper so
 * the caller always receives a confirmed snapshot rather than the raw input.
 *
 * @param cell - The live users FeatureCell instance.
 * @param nextState - The domain state to commit.
 * @param loading - Whether to mark the snapshot as loading. Defaults to `false`.
 * @param error - An optional error to attach to the snapshot. Defaults to `null`.
 * @returns A promise that resolves with the committed `UsersState`.
 */
async function commitUsersState(
  cell: UsersCell,
  nextState: UsersState,
  loading = false,
  error: Error | null = null
): Promise<UsersState> {
  const nextEmission = waitForNextUsersState(cell);
  cell.replaceState({
    loading,
    error,
    value: stampUsersState(nextState)
  });
  return nextEmission;
}

/**
 * Creates the users FeatureCell with an empty initial collection and registers
 * a pure reducer that recomputes `totalLoaded` after each committed snapshot.
 * The cell is a module-level singleton; all HTTP requests share this instance
 * and the SDuX Vault conductor queue serializes every write.
 *
 * @returns The initialized users FeatureCell instance.
 */
export function createUsersCell() {
  const cell = FeatureCell<UsersState>({
    key: 'users',
    initialState: {
      users: [],
      totalLoaded: 0,
      lastRefresh: new Date().toISOString()
    }
  });

  cell
    .reducers([
      // Reducer 1: Count loaded users
      (current) => ({
        ...current,
        totalLoaded: current.users.filter((u) => u.status === 'loaded').length
      })
    ])
    .initialize();

  return cell;
}

/**
 * Simulates a remote API call that resolves with user data after a short
 * random delay. User ID 999 always rejects to demonstrate how the pipeline
 * handles async errors and commits an error state for that entry.
 *
 * @param userId - The ID of the user to load.
 * @returns A promise that resolves with a loaded `User`, or rejects for ID 999.
 */
export async function loadUserFromAPI(userId: number): Promise<User> {
  // Simulate network delay
  await new Promise((resolve) =>
    setTimeout(resolve, 500 + Math.random() * 500)
  );

  // Simulate occasional failures
  if (userId === 999) {
    throw new Error(`User ${userId} not found`);
  }

  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    status: 'loaded'
  };
}

/**
 * Loads a single user through the full commit → emission pattern. If the user
 * is not yet in state, a loading placeholder is committed first so the entry
 * is immediately visible. The API call then resolves — or rejects — and a
 * second commit captures the final status.
 *
 * @param cell - The live users FeatureCell instance.
 * @param userId - The ID of the user to load.
 * @returns A promise that resolves with the committed `UsersState` after the user is loaded or errored.
 */
export async function loadUser(
  cell: UsersCell,
  userId: number
): Promise<UsersState> {
  const existingUser = getUsersValue(cell).users.find(
    (user) => user.id === userId
  );

  if (!existingUser) {
    const nextState = getUsersValue(cell);

    await commitUsersState(cell, {
      ...nextState,
      users: upsertUser(nextState.users, createLoadingUser(userId))
    });
  }

  try {
    const userData = await loadUserFromAPI(userId);
    const resolved = getUsersValue(cell);

    return commitUsersState(cell, {
      ...resolved,
      users: upsertUser(resolved.users, userData)
    });
  } catch (error) {
    const resolved = getUsersValue(cell);
    return commitUsersState(cell, {
      ...resolved,
      users: upsertUser(resolved.users, {
        ...createLoadingUser(userId),
        status: 'error',
        errorMessage: String(error)
      })
    });
  }
}

/**
 * Loads multiple users concurrently by first committing all pending loading
 * placeholders in a single snapshot, then dispatching parallel API calls.
 * Duplicate IDs are deduplicated before dispatch so each user is fetched once.
 *
 * @param cell - The live users FeatureCell instance.
 * @param userIds - The array of user IDs to load.
 * @returns A promise that resolves with the final `UsersState` after all users settle.
 */
export async function loadUsers(
  cell: UsersCell,
  userIds: number[]
): Promise<UsersState> {
  const nextUserIds = uniqueUserIds(userIds);
  const current = getUsersValue(cell);
  const existingUserIds = new Set(current.users.map((user) => user.id));
  const pendingUsers = nextUserIds
    .filter((userId) => !existingUserIds.has(userId))
    .map((userId) => createLoadingUser(userId));

  if (pendingUsers.length > 0) {
    await commitUsersState(cell, {
      ...current,
      users: [...current.users, ...pendingUsers]
    });
  }

  await Promise.all(nextUserIds.map((id) => loadUser(cell, id)));
  return getUsersValue(cell);
}

/**
 * Removes all users from state and commits the cleared collection. The
 * reducer runs after the commit and resets `totalLoaded` to zero.
 *
 * @param cell - The live users FeatureCell instance.
 * @returns A promise that resolves with the committed `UsersState` after clearing.
 */
export async function clearUsers(cell: UsersCell): Promise<UsersState> {
  const current = getUsersValue(cell);
  return commitUsersState(cell, {
    ...current,
    users: []
  });
}
