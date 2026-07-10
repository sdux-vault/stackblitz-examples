declare const Bun: {
  serve(options: {
    port: number;
    fetch(request: Request): Response | Promise<Response>;
  }): unknown;
};

import {
  createCounterCell,
  incrementCounter,
  replaceCounter,
  resetCounter
} from './state';

/**
 * Simple HTTP server demonstrating state replacement with SDuX Vault
 *
 * Endpoints:
 * GET  /state         — Get current counter state
 * POST /increment     — Increment counter by 1
 * POST /reset         — Reset counter to 0
 * POST /replace       — Replace entire counter state
 */

const PORT = 3000;
const counter = createCounterCell();

/**
 * Returns the current committed counter domain value from `snapshot.value`.
 * This is the value exposed to HTTP clients — the full SDuX Vault snapshot
 * wrapper is intentionally stripped so responses contain only domain data.
 *
 * @returns The current `CounterState`, or `undefined` if the cell has no commit yet.
 */
function getCounterResponse() {
  return counter.state.value;
}

/**
 * Type guard that validates the shape of the POST /replace request body.
 * Ensures callers supply the required `count` and `label` fields before the
 * server attempts a state replacement, preventing pipeline errors from
 * malformed input.
 *
 * @param body - The raw parsed JSON value from the request.
 * @returns `true` when `body` is a valid `ReplaceCounterInput` shape.
 */
function isReplaceCounterBody(body: unknown): body is {
  count: number;
  label: string;
  lastUpdate?: string;
} {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const payload = body as Record<string, unknown>;

  return (
    typeof payload.count === 'number' &&
    typeof payload.label === 'string' &&
    (payload.lastUpdate === undefined || typeof payload.lastUpdate === 'string')
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
      // GET /state — Return current counter state
      if (pathname === '/state' && request.method === 'GET') {
        return new Response(JSON.stringify(getCounterResponse(), null, 2), {
          status: 200,
          headers: corsHeaders
        });
      }

      // POST /increment — Increment by 1
      if (pathname === '/increment' && request.method === 'POST') {
        const newState = await incrementCounter(counter);
        return new Response(JSON.stringify(newState, null, 2), {
          status: 200,
          headers: corsHeaders
        });
      }

      // POST /reset — Reset to 0
      if (pathname === '/reset' && request.method === 'POST') {
        const newState = await resetCounter(counter);
        return new Response(JSON.stringify(newState, null, 2), {
          status: 200,
          headers: corsHeaders
        });
      }

      // POST /replace — Replace entire state
      if (pathname === '/replace' && request.method === 'POST') {
        const body = await request.json();

        if (!isReplaceCounterBody(body)) {
          return new Response(
            JSON.stringify({
              error: 'Bad Request',
              message:
                'POST /replace requires a JSON body with numeric count and string label. lastUpdate is optional.'
            }),
            {
              status: 400,
              headers: corsHeaders
            }
          );
        }

        const newState = await replaceCounter(counter, body);
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
              message: 'SDuX Vault Bun Replace Example',
              endpoints: {
                'GET /state': 'Get current counter state',
                'POST /increment': 'Increment counter by 1',
                'POST /reset': 'Reset counter to 0',
                'POST /replace':
                  'Replace the counter state (send JSON body with count and label; lastUpdate optional)'
              },
              example: {
                curl_get_state: 'curl http://localhost:3000/state',
                curl_increment: 'curl -X POST http://localhost:3000/increment',
                curl_replace:
                  'curl -X POST -H "Content-Type: application/json" -d \'{"count": 42, "label": "Custom Count"}\' http://localhost:3000/replace'
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
