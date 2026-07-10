declare const Bun: {
  serve(options: {
    port: number;
    fetch(request: Request): Response | Promise<Response>;
  }): unknown;
};

import {
  clearPosts,
  createBlogCell,
  fetchPost,
  fetchPosts,
  selectPost
} from './state';

/**
 * REST API demonstrating stateful HTTP resource handling with SDuX Vault
 *
 * Uses JSONPlaceholder (free public API) for post data.
 *
 * Endpoints:
 * GET  /                  — API documentation and examples
 * GET  /state             — Get current blog state
 * POST /posts/:id         — Fetch a single post by ID
 * POST /posts/batch       — Fetch multiple posts (send JSON: {"postIds": [1,2,3]})
 * POST /posts/:id/select  — Select a post
 * POST /clear             — Clear all posts
 */

const PORT = 3000;
const blogCell = createBlogCell();

/**
 * Returns the current committed blog domain value from `snapshot.value`.
 * The full SDuX Vault snapshot wrapper is stripped so HTTP clients receive
 * only the domain data they need.
 *
 * @returns The current `BlogState`, or `undefined` if no commit has occurred.
 */
function getBlogResponse() {
  return blogCell.state.value;
}

/**
 * Validates that a given value is a positive integer. Used by the batch
 * body type guard to verify each element in the `postIds` array before
 * the server dispatches parallel fetch operations.
 *
 * @param value - The value to check.
 * @returns `true` when `value` is an integer greater than zero.
 */
function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

/**
 * Type guard that validates the shape of the POST /posts/batch request body.
 * Ensures the `postIds` field is present and contains only positive integers
 * before the server attempts concurrent post fetches.
 *
 * @param body - The raw parsed JSON value from the request.
 * @returns `true` when `body` is a valid batch fetch payload.
 */
function isFetchPostsBody(body: unknown): body is { postIds: number[] } {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const payload = body as Record<string, unknown>;

  return (
    Array.isArray(payload.postIds) &&
    payload.postIds.every((postId) => isPositiveInteger(postId))
  );
}

const _server = Bun.serve({
  port: PORT,
  async fetch(request: Request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET /state — Return current blog state
      if (pathname === '/state' && request.method === 'GET') {
        return new Response(JSON.stringify(getBlogResponse(), null, 2), {
          status: 200,
          headers: corsHeaders
        });
      }

      // POST /posts/:id — Fetch a single post
      const postMatch =
        pathname.match(/^\/posts\/(\d+)$/) && request.method === 'POST';
      if (postMatch) {
        const postId = parseInt(pathname.split('/')[2], 10);
        const newState = await fetchPost(blogCell, postId);
        return new Response(JSON.stringify(newState, null, 2), {
          status: 200,
          headers: corsHeaders
        });
      }

      // POST /posts/batch — Fetch multiple posts
      if (pathname === '/posts/batch' && request.method === 'POST') {
        const body = await request.json();

        if (!isFetchPostsBody(body)) {
          return new Response(
            JSON.stringify({
              error: 'Bad Request',
              message:
                'POST /posts/batch requires a JSON body with postIds as an array of positive integers.'
            }),
            {
              status: 400,
              headers: corsHeaders
            }
          );
        }

        const postIds = body.postIds;
        const newState = await fetchPosts(blogCell, postIds);
        return new Response(JSON.stringify(newState, null, 2), {
          status: 200,
          headers: corsHeaders
        });
      }

      // POST /posts/:id/select — Select a post
      const selectMatch =
        pathname.match(/^\/posts\/(\d+)\/select$/) && request.method === 'POST';
      if (selectMatch) {
        const postId = parseInt(pathname.split('/')[2], 10);
        const newState = await selectPost(blogCell, postId);
        return new Response(JSON.stringify(newState, null, 2), {
          status: 200,
          headers: corsHeaders
        });
      }

      // POST /clear — Clear all posts
      if (pathname === '/clear' && request.method === 'POST') {
        const newState = await clearPosts(blogCell);
        return new Response(JSON.stringify(newState, null, 2), {
          status: 200,
          headers: corsHeaders
        });
      }

      // GET / — API documentation
      if (pathname === '/' && request.method === 'GET') {
        return new Response(
          JSON.stringify(
            {
              message: 'SDuX Vault Bun HTTP Resource Example',
              description:
                'Stateful REST API for managing blog posts with deterministic pipeline orchestration',
              dataSource:
                'JSONPlaceholder (https://jsonplaceholder.typicode.com)',
              endpoints: {
                'GET /state': 'Get current blog state',
                'POST /posts/:id': 'Fetch a single post by ID from remote API',
                'POST /posts/batch':
                  'Fetch multiple posts concurrently (send JSON: {"postIds": [1,2,3]}; duplicate IDs are ignored)',
                'POST /posts/:id/select': 'Select/focus a specific post',
                'POST /clear': 'Clear all posts'
              },
              examples: {
                get_state: 'curl http://localhost:3000/state',
                fetch_single: 'curl -X POST http://localhost:3000/posts/1',
                fetch_batch:
                  'curl -X POST -H "Content-Type: application/json" -d \'{"postIds": [1,2,3]}\' http://localhost:3000/posts/batch',
                select_post:
                  'curl -X POST http://localhost:3000/posts/1/select',
                clear: 'curl -X POST http://localhost:3000/clear'
              },
              architecture: {
                state_management:
                  'All API responses update a single FeatureCell and expose the current domain value from snapshot.value',
                determinism:
                  'Each fetch commits a complete snapshot, then a pure reducer recomputes totalPosts from the committed posts collection',
                pipeline:
                  'HTTP resources commit state and await the next state$ emission for the finalized snapshot',
                batch_validation:
                  'POST /posts/batch requires postIds to be an array of positive integers',
                batch_loading:
                  'POST /posts/batch commits one loading snapshot up front so every requested post is visible before parallel fetches complete',
                concurrency:
                  'Batch fetches load in parallel but commit state deterministically'
              }
            },
            null,
            2
          ),
          {
            status: 200,
            headers: corsHeaders
          }
        );
      }

      // 404 Not Found
      return new Response(
        JSON.stringify({ error: 'Not Found', path: pathname }),
        {
          status: 404,
          headers: corsHeaders
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: String(error)
        }),
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }
  }
});

console.log(`✅ Server running at http://localhost:${PORT}`);
console.log(`📝 Try: curl http://localhost:${PORT}`);
console.log(`📖 Fetch post: curl -X POST http://localhost:${PORT}/posts/1`);
console.log(
  `📚 Fetch batch: curl -X POST -H "Content-Type: application/json" -d '{"postIds": [1,2,3]}' http://localhost:${PORT}/posts/batch`
);
