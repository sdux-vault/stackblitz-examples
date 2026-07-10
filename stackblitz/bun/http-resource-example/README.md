# SDuX Vault Bun HTTP Resource Example

A REST API demonstrating stateful HTTP resource management with deterministic pipeline orchestration using SDuX Vault on Bun.

## What This Example Shows

- **Stateful HTTP Resources**: Managing remote API data in a structured state model
- **Concurrent Resource Loading**: Fetch multiple resources in parallel with deterministic state updates
- **Deterministic Pipeline**: Resource fetches commit complete snapshots and use pure reducers for derived totals
- **Real External API**: Uses JSONPlaceholder (free, public API) for realistic data fetching
- **Error Handling**: Graceful failure handling with state tracking
- **Resource Selection**: Manage selected/focused resources as first-class state

## The Queue Is the Architecture

State management in a server only works reliably when two conditions are met:

1. **A serializing queue** — every write enters a single ordered execution path
2. **A long-lived singleton** — the cell outlives any individual request

This server satisfies both. The `blogCell` is a module-level singleton created once at startup. Every `replaceState()` call enters the SDuX Vault conductor queue, which serializes all pipeline writes in FIFO order. The queue is the correctness mechanism — not the application code around it.

HTTP resource orchestration is one of the most natural fits for this model: fetch data from a remote API, commit it to state, let the reducer derive counts and metadata, observe the confirmed snapshot, respond to the client. The pipeline handles each commit atomically — reducers always see the fully resolved previous state, never a partial intermediate.

> **Community note**: If you want to take this further, move state derivation entirely into reducers so it runs under the queue's serialization guarantee. That closes the read-modify-write window that exists when application code reads `cell.state.value` before calling `replaceState()`. That's a great first contribution.

## Quick Start

```bash
bun install
bun start
```

Server starts at `http://localhost:3000`

## API Endpoints

### GET /

API documentation with all endpoints and examples

```bash
curl http://localhost:3000
```

### GET /state

Get the current blog domain value from `snapshot.value` (including posts, selection, and counts)

```bash
curl http://localhost:3000/state
```

Response:

```json
{
  "posts": [
    {
      "id": 1,
      "userId": 1,
      "title": "sunt aut facere repellat provident...",
      "body": "quia et suscipit...",
      "status": "loaded",
      "createdAt": "2026-07-09T12:34:56.789Z"
    }
  ],
  "selectedPostId": null,
  "totalPosts": 1,
  "lastFetch": "2026-07-09T12:34:56.789Z",
  "isRefreshing": false
}
```

### POST /posts/:id

Fetch a single post by ID from JSONPlaceholder API

```bash
# Fetch post 1
curl -X POST http://localhost:3000/posts/1

# Fetch post 10
curl -X POST http://localhost:3000/posts/10

# Check state
curl http://localhost:3000/state
```

Post progresses through states:

1. `loading` — added to collection
2. `loaded` — data received from API
3. `error` — if fetch fails

### POST /posts/batch

Fetch multiple posts concurrently. The request body must include `postIds` as an array of positive integers. Duplicate IDs are deduplicated in first-seen order.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"postIds": [1, 5, 10, 15, 20]}' \
  http://localhost:3000/posts/batch
```

All posts fetch in parallel, but the batch path first commits one loading snapshot so every requested post is visible before the remote fetches resolve. After each committed emission, the pure reducer updates:

1. Total post count

### POST /posts/:id/select

Select a specific post to focus on

```bash
curl -X POST http://localhost:3000/posts/1/select
curl http://localhost:3000/state
```

### POST /clear

Clear all posts and deselect

```bash
curl -X POST http://localhost:3000/clear
curl http://localhost:3000/state
```

## How It Works

### Commit → Emission for HTTP Resources

```typescript
async function fetchPost(
  cell: FeatureCell<BlogState>,
  postId: number
): Promise<BlogState> {
  await commitBlogState(cell, {
    ...getBlogValue(cell),
    posts: [...getBlogValue(cell).posts, { id: postId, status: 'loading' }]
  });

  try {
    const postData = await fetchPostFromAPI(postId);

    return commitBlogState(cell, {
      ...getBlogValue(cell),
      posts: getBlogValue(cell).posts.map((p) =>
        p.id === postId ? { ...p, ...postData } : p
      )
    });
  } catch (error) {
    return commitBlogState(cell, {
      ...getBlogValue(cell),
      posts: getBlogValue(cell).posts.map((p) =>
        p.id === postId
          ? { ...p, status: 'error', errorMessage: String(error) }
          : p
      )
    });
  }
}
```

### Reducer Composition for Resource Counts

```typescript
cell.reducers([
  // Reducer 1: Update total count
  (current) => ({
    ...current,
    totalPosts: current.posts.filter((p) => p.status === 'loaded').length
  })
]);
```

`lastFetch` is stamped in the request helper before each `replaceState()` call so the reducer stays side-effect free while the count remains accurate.

## Why This Pattern is Powerful

1. **No Redux action boilerplate**: Just call `fetchPost()`, reducers update automatically
2. **Deterministic concurrency**: Fetch 100 posts in parallel; committed emissions still produce correct counts
3. **Single source of truth**: All resource state lives in one FeatureCell
4. **Server-side rendering ready**: Entire state can be serialized and sent to clients
5. **No lost updates**: Concurrent fetches merge against the latest committed collection so parallel requests keep every post
6. **Visible batch startup**: Batch requests commit one loading snapshot before parallel fetches begin
7. **Duplicate-safe batches**: Repeated IDs do not trigger redundant fetches or duplicate posts in state

## Try It Live

Terminal 1:

```bash
bun start
```

Terminal 2:

```bash
# Check initial state
curl http://localhost:3000/state

# Fetch a few posts
curl -X POST http://localhost:3000/posts/1
curl -X POST http://localhost:3000/posts/2
curl -X POST http://localhost:3000/posts/3

# Check state — 3 loaded posts
curl http://localhost:3000/state

# Load a batch all at once (fetches in parallel)
curl -X POST -H "Content-Type: application/json" \
  -d '{"postIds": [10, 11, 12, 13, 14]}' \
  http://localhost:3000/posts/batch

# State now shows 8 loaded posts total
curl http://localhost:3000/state

# Select one
curl -X POST http://localhost:3000/posts/1/select

# Clear and start over
curl -X POST http://localhost:3000/clear
curl http://localhost:3000/state
```

## Development Mode

```bash
bun --watch src/main.ts
```

Server auto-restarts on file changes.

## Real-World Extensions

This example is a foundation for:

- **Pagination**: Add `pageIndex` and `pageSize` to state, manage page loads
- **Filtering**: Add `tags` or `search` filter, re-fetch with criteria
- **Caching**: Check if post already loaded before fetching
- **Refresh**: Mark specific resources as stale, refresh on demand
- **Mutations**: POST/PUT endpoints that trigger update-and-refetch flows
- **Subscriptions**: Real-time updates push new posts to clients
