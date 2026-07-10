declare const Bun: {
  serve(options: {
    port: number;
    fetch(request: Request): Response | Promise<Response>;
  }): unknown;
};

import { clearUsers, createUsersCell, loadUser, loadUsers } from './state';

/**
 * HTTP server demonstrating async promise resolution with SDuX Vault
 *
 * Endpoints:
 * GET  /state         — Get current users state
 * POST /load/:id      — Load a single user by ID
 * POST /load-batch    — Load multiple users (send JSON array: {"userIds": [1,2,3]})
 * POST /clear         — Clear all users
 */

const PORT = 3000;
const usersCell = createUsersCell();

/**
 * Returns the current committed users domain value from `snapshot.value`.
 * The full SDuX Vault snapshot wrapper is stripped so HTTP clients receive
 * only the domain data they need.
 *
 * @returns The current `UsersState`, or `undefined` if no commit has occurred.
 */
function getUsersResponse() {
  return usersCell.state.value;
}

/**
 * Validates that a given value is a positive integer. Used by the batch
 * body type guard to verify each element in the `userIds` array before
 * the server dispatches parallel load operations.
 *
 * @param value - The value to check.
 * @returns `true` when `value` is an integer greater than zero.
 */
function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

/**
 * Type guard that validates the shape of the POST /load-batch request body.
 * Ensures the `userIds` field is present and contains only positive integers
 * before the server attempts concurrent user loads.
 *
 * @param body - The raw parsed JSON value from the request.
 * @returns `true` when `body` is a valid batch load payload.
 */
function isLoadBatchBody(body: unknown): body is { userIds: number[] } {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const payload = body as Record<string, unknown>;

  return (
    Array.isArray(payload.userIds) &&
    payload.userIds.every((userId) => isPositiveInteger(userId))
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
      // GET /state — Return current users state
      if (pathname === '/state' && request.method === 'GET') {
        return new Response(JSON.stringify(getUsersResponse(), null, 2), {
          status: 200,
          headers: corsHeaders
        });
      }

      // POST /load/:id — Load a single user
      const loadMatch = pathname.match(/^\/load\/(\d+)$/);
      if (loadMatch && request.method === 'POST') {
        const userId = parseInt(loadMatch[1], 10);
        const newState = await loadUser(usersCell, userId);
        return new Response(JSON.stringify(newState, null, 2), {
          status: 200,
          headers: corsHeaders
        });
      }

      // POST /load-batch — Load multiple users
      if (pathname === '/load-batch' && request.method === 'POST') {
        const body = await request.json();

        if (!isLoadBatchBody(body)) {
          return new Response(
            JSON.stringify({
              error: 'Bad Request',
              message:
                'POST /load-batch requires a JSON body with userIds as an array of positive integers.'
            }),
            {
              status: 400,
              headers: corsHeaders
            }
          );
        }

        const userIds = body.userIds;
        const newState = await loadUsers(usersCell, userIds);
        return new Response(JSON.stringify(newState, null, 2), {
          status: 200,
          headers: corsHeaders
        });
      }

      // POST /clear — Clear all users
      if (pathname === '/clear' && request.method === 'POST') {
        const newState = await clearUsers(usersCell);
        return new Response(JSON.stringify(newState, null, 2), {
          status: 200,
          headers: corsHeaders
        });
      }

      // GET / — Health check with instructions
      if (pathname === '/' && request.method === 'GET') {
        return new Response(
          JSON.stringify(
            {
              message: 'SDuX Vault Bun Promise Example',
              description:
                'Demonstrates async promise resolution with deterministic pipeline',
              endpoints: {
                'GET /state': 'Get current users state',
                'POST /load/:id':
                  'Load a single user by ID (simulates 500-1000ms API delay)',
                'POST /load-batch':
                  'Load multiple users concurrently (send JSON: {"userIds": [1,2,3]}; duplicate IDs are ignored)',
                'POST /clear': 'Clear all users'
              },
              examples: {
                get_state: 'curl http://localhost:3000/state',
                load_single: 'curl -X POST http://localhost:3000/load/1',
                load_batch:
                  'curl -X POST -H "Content-Type: application/json" -d \'{"userIds": [1,2,3]}\' http://localhost:3000/load-batch',
                load_error: 'curl -X POST http://localhost:3000/load/999',
                clear: 'curl -X POST http://localhost:3000/clear'
              },
              notes: {
                determinism:
                  'Each API call commits one snapshot, then a pure reducer recomputes totalLoaded from the committed users collection',
                settlement:
                  'Each write awaits the next state$ emission to observe the committed snapshot',
                batch_validation:
                  'POST /load-batch requires userIds to be an array of positive integers',
                batch_loading:
                  'POST /load-batch commits one loading snapshot up front so every requested user is visible before parallel API work completes',
                errors:
                  'User ID 999 will simulate an error; you can observe the error handling in the returned state'
              },
              responses: {
                state_endpoint:
                  'GET /state returns the current domain value from snapshot.value, not the full SDuX Vault snapshot wrapper'
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
console.log(`⚡ Load a user: curl -X POST http://localhost:${PORT}/load/1`);
console.log(
  `📦 Load batch: curl -X POST -H "Content-Type: application/json" -d '{"userIds": [1,2,3]}' http://localhost:${PORT}/load-batch`
);
