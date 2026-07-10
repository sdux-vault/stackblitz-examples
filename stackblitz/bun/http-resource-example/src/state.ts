import { FeatureCell } from '@sdux-vault/core';
import { firstValueFrom } from 'rxjs';
import { skip } from 'rxjs/operators';

/**
 * Represents a single blog post entry. The `status` field tracks the post
 * through its async loading lifecycle so each committed snapshot reflects
 * the exact state of every resource in the collection.
 */
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
  status: 'loading' | 'loaded' | 'error';
  createdAt: string;
  errorMessage?: string;
}

/**
 * Defines the domain state managed by the blog FeatureCell. Holds the full
 * post collection alongside derived counts and metadata. `totalPosts` is
 * recomputed by the reducer after each commit; `lastFetch` is stamped before
 * each `replaceState` call to keep the reducer side-effect free.
 */
export interface BlogState {
  posts: Post[];
  selectedPostId: number | null;
  totalPosts: number;
  lastFetch: string;
  isRefreshing: boolean;
}

/**
 * Convenience alias for the return type of `createBlogCell`. Lets helper
 * functions accept the live cell instance without importing a separate type.
 */
type BlogCell = ReturnType<typeof createBlogCell>;

/**
 * Constructs a placeholder `Post` entry in the `loading` status. This record
 * is committed to state before the remote fetch begins so observers see the
 * post appear immediately rather than only after the network round-trip.
 *
 * @param postId - The numeric ID of the post being fetched.
 * @returns A `Post` object with `status: 'loading'` and empty content fields.
 */
function createLoadingPost(postId: number): Post {
  return {
    id: postId,
    userId: 0,
    title: '',
    body: '',
    status: 'loading',
    createdAt: new Date().toISOString()
  };
}

/**
 * Performs an immutable insert-or-replace of a post in the collection.
 * Matching is done by `id`; if no entry exists the post is appended.
 * This ensures concurrent fetches each read the latest committed array
 * and apply their update without losing entries added by other requests.
 *
 * @param posts - The current committed posts array.
 * @param nextPost - The post record to insert or replace.
 * @returns A new array with the post inserted or updated in place.
 */
function upsertPost(posts: Post[], nextPost: Post): Post[] {
  const postIndex = posts.findIndex((post) => post.id === nextPost.id);

  if (postIndex === -1) {
    return [...posts, nextPost];
  }

  return posts.map((post) => (post.id === nextPost.id ? nextPost : post));
}

/**
 * Removes duplicate IDs from a batch request in first-seen order. Calling
 * this before dispatching parallel fetches prevents the same post from being
 * fetched twice and appearing as duplicate entries in state.
 *
 * @param postIds - The raw array of post IDs from the HTTP request body.
 * @returns A deduplicated array of post IDs preserving original order.
 */
function uniquePostIds(postIds: number[]): number[] {
  return [...new Set(postIds)];
}

/**
 * Applies a fresh `lastFetch` timestamp to the next state before it enters
 * the pipeline. Stamping happens here rather than inside a reducer so that
 * reducers stay pure and operate only on already-committed domain values.
 *
 * @param nextState - The state object to stamp.
 * @returns A copy of `nextState` with `lastFetch` set to the current time.
 */
function stampBlogState(nextState: BlogState): BlogState {
  return {
    ...nextState,
    lastFetch: new Date().toISOString()
  };
}

/**
 * Reads the current committed blog state from the FeatureCell snapshot.
 * Falls back to an empty collection when the cell has not yet received a
 * commit, ensuring callers always receive a valid `BlogState` object.
 *
 * @param cell - The live blog FeatureCell instance.
 * @returns The current `BlogState`, or an empty default if no commit exists.
 */
function getBlogValue(cell: BlogCell): BlogState {
  return (
    cell.state.value ?? {
      posts: [],
      selectedPostId: null,
      totalPosts: 0,
      lastFetch: new Date().toISOString(),
      isRefreshing: false
    }
  );
}

/**
 * Subscribes to `state$` and resolves with the next committed snapshot.
 * Calling code registers this listener before issuing a `replaceState` so
 * the resulting emission corresponds to that specific write.
 *
 * @param cell - The live blog FeatureCell instance.
 * @returns A promise that resolves with the next committed `BlogState`.
 */
async function waitForNextBlogState(cell: BlogCell): Promise<BlogState> {
  const emit = await firstValueFrom(cell.state$.pipe(skip(1)));
  return emit.snapshot.value as BlogState;
}

/**
 * Stamps the next state, submits it to the FeatureCell via `replaceState`,
 * and awaits the resulting committed emission. Every state change in this
 * example flows through this helper so callers always receive a confirmed
 * snapshot after the full pipeline has executed.
 *
 * @param cell - The live blog FeatureCell instance.
 * @param nextState - The domain state to commit.
 * @param loading - Whether to mark the snapshot as loading. Defaults to `false`.
 * @param error - An optional error to attach to the snapshot. Defaults to `null`.
 * @returns A promise that resolves with the committed `BlogState`.
 */
async function commitBlogState(
  cell: BlogCell,
  nextState: BlogState,
  loading = false,
  error: Error | null = null
): Promise<BlogState> {
  const nextEmission = waitForNextBlogState(cell);
  cell.replaceState({
    loading,
    error,
    value: stampBlogState(nextState)
  });
  return nextEmission;
}

/**
 * Creates the blog FeatureCell with an empty initial collection and registers
 * a pure reducer that recomputes `totalPosts` from the committed posts array
 * after each pipeline execution. The cell is a module-level singleton; all
 * HTTP requests share this instance and the SDuX Vault conductor queue
 * serializes every write.
 *
 * @returns The initialized blog FeatureCell instance.
 */
export function createBlogCell() {
  const cell = FeatureCell<BlogState>({
    key: 'blog',
    initialState: {
      posts: [],
      selectedPostId: null,
      totalPosts: 0,
      lastFetch: new Date().toISOString(),
      isRefreshing: false
    }
  });

  cell
    .reducers([
      // Reducer 1: Update total count
      (current: BlogState) => ({
        ...current,
        totalPosts: current.posts.filter((p) => p.status === 'loaded').length
      })
    ])
    .initialize();

  return cell;
}

/**
 * Fetches a single post from JSONPlaceholder and maps the response to the
 * `Post` shape. Throws when the HTTP response is not successful so the
 * calling code can commit an error state for that entry.
 *
 * @param postId - The ID of the post to fetch from the remote API.
 * @returns A promise that resolves with a loaded `Post` record.
 * @throws When the remote API returns a non-2xx response.
 */
export async function fetchPostFromAPI(postId: number): Promise<Post> {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${postId}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch post ${postId}`);
  }
  const data = await response.json();
  return {
    id: data.id,
    userId: data.userId,
    title: data.title,
    body: data.body,
    status: 'loaded',
    createdAt: new Date().toISOString()
  };
}

/**
 * Fetches a single post through the full commit → emission pattern. If the
 * post is not yet in state, a loading placeholder is committed first so the
 * entry is immediately visible. The remote fetch then resolves — or rejects
 * — and a second commit captures the final status.
 *
 * @param cell - The live blog FeatureCell instance.
 * @param postId - The ID of the post to fetch.
 * @returns A promise that resolves with the committed `BlogState` after the post is loaded or errored.
 */
export async function fetchPost(
  cell: BlogCell,
  postId: number
): Promise<BlogState> {
  const existingPost = getBlogValue(cell).posts.find(
    (post) => post.id === postId
  );

  if (!existingPost) {
    const nextState = getBlogValue(cell);

    await commitBlogState(cell, {
      ...nextState,
      posts: upsertPost(nextState.posts, createLoadingPost(postId))
    });
  }

  try {
    const postData = await fetchPostFromAPI(postId);
    const resolved = getBlogValue(cell);

    return commitBlogState(cell, {
      ...resolved,
      posts: upsertPost(resolved.posts, postData)
    });
  } catch (error) {
    const resolved = getBlogValue(cell);
    return commitBlogState(cell, {
      ...resolved,
      posts: upsertPost(resolved.posts, {
        ...createLoadingPost(postId),
        status: 'error',
        errorMessage: String(error)
      })
    });
  }
}

/**
 * Fetches multiple posts concurrently by first committing all pending loading
 * placeholders and setting `isRefreshing: true` in a single snapshot, then
 * dispatching parallel remote fetches. Duplicate IDs are deduplicated before
 * dispatch. A final commit clears `isRefreshing` once all fetches settle.
 *
 * @param cell - The live blog FeatureCell instance.
 * @param postIds - The array of post IDs to fetch.
 * @returns A promise that resolves with the final `BlogState` after all posts settle.
 */
export async function fetchPosts(
  cell: BlogCell,
  postIds: number[]
): Promise<BlogState> {
  const nextPostIds = uniquePostIds(postIds);
  const current = getBlogValue(cell);
  const existingPostIds = new Set(current.posts.map((post) => post.id));
  const pendingPosts = nextPostIds
    .filter((postId) => !existingPostIds.has(postId))
    .map((postId) => createLoadingPost(postId));

  await commitBlogState(cell, {
    ...current,
    posts: [...current.posts, ...pendingPosts],
    isRefreshing: true
  });

  await Promise.all(nextPostIds.map((id) => fetchPost(cell, id)));

  return commitBlogState(cell, {
    ...getBlogValue(cell),
    isRefreshing: false
  });
}

/**
 * Sets the `selectedPostId` field and commits the updated state. This is a
 * pure domain selection operation — no remote fetch is triggered.
 *
 * @param cell - The live blog FeatureCell instance.
 * @param postId - The ID of the post to select.
 * @returns A promise that resolves with the committed `BlogState`.
 */
export async function selectPost(
  cell: BlogCell,
  postId: number
): Promise<BlogState> {
  return commitBlogState(cell, {
    ...getBlogValue(cell),
    selectedPostId: postId
  });
}

/**
 * Clears all posts and deselects the current selection in a single committed
 * snapshot. The reducer runs after the commit and resets `totalPosts` to zero.
 *
 * @param cell - The live blog FeatureCell instance.
 * @returns A promise that resolves with the committed `BlogState` after clearing.
 */
export async function clearPosts(cell: BlogCell): Promise<BlogState> {
  return commitBlogState(cell, {
    ...getBlogValue(cell),
    posts: [],
    selectedPostId: null
  });
}
