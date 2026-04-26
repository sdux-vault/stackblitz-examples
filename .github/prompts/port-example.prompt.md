---
agent: ask
description: 'Port an Angular StackBlitz example to another framework (React, Vue, or Svelte). Usage: @port <angular-example-name> --to=<framework>'
---

# Port StackBlitz Example — Cross-Framework Translation

## Role

You are a cross-framework porting agent. Your task is to translate a completed
Angular StackBlitz example into an idiomatic example for the target framework
(React, Vue, or Svelte).

The Angular example is always the canonical source of truth for:

- Pipeline configuration (filters, reducers, interceptors, delay, etc.)
- UI layout and structure
- Component behavior and user interactions
- State management patterns

---

## Inputs

The user provides:

1. **Source Angular example name** — a directory under `stackblitz/angular/`
2. **Target framework** — one of `react`, `vue`, or `svelte`
3. **Example name** — usually the same kebab-case name as the Angular example

If the user omits the example name, reuse the Angular example's directory name.

---

## Execution Steps

### Step 1 — Read the base Angular example

The base example is always `stackblitz/angular/basic-filter-reducer-example/`.
Read all source files from this directory first. This is the shared foundation
that all other examples are built on.

### Step 2 — Read the source Angular example and identify the delta

Read all source files from `stackblitz/angular/<example-name>/`:

- `src/app/*.ts` — service, component, config
- `src/app/*.html` — template
- `src/app/*.scss` — component styles
- `src/styles.scss` — global styles
- `src/main.ts` — bootstrap
- `src/index.html` — HTML shell
- `package.json` — dependencies

Compare every file against the base example to isolate what changed:

- Files only in the source example (e.g., `elapsed-timer.ts`)
- Files with content differences (e.g., different pipeline config, template sections)
- Files that are identical to the base (these are shared shell code)

Record the delta. Only the delta needs to be ported. Shared code comes from the
existing target framework base example or scaffolding template.

### Step 3 — Read the target framework scaffolding template

Read all files from `tools/<framework>/templates/scaffolding/`:

- Entry point (`main.tsx`, `main.ts`, etc.)
- Config files (`vite.config.ts`, `tsconfig.json`, etc.)
- Root component (`App.tsx`, `App.vue`, `App.svelte`)
- `package.json`
- `index.html`

### Step 4 — Read an existing target framework example (if any)

If `stackblitz/<framework>/` already contains examples, read one to align on:

- File naming conventions
- Import patterns for `@sdux-vault/core`
- Component structure and idioms
- State binding patterns

Use local precedent as a style guide only.

### Step 5 — Create the new example from the target framework's base

If `stackblitz/<framework>/basic-filter-reducer-example/` exists, use it as the
starting point — copy all its files into `stackblitz/<framework>/<example-name>/`,
then apply the delta identified in Step 2 on top.

If no base example exists for the target framework yet, use the scaffolding
template from Step 3 and port the full Angular base example first, then apply
the delta.

The goal: the relationship between the base and the new example in the target
framework should mirror the same relationship in Angular.

### Step 6 — Port the service logic

Translate the Angular `ExampleService` to the target framework:

| Angular Pattern                                                                    | React                                             | Vue                                      | Svelte                                   |
| ---------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| `@Injectable` service class                                                        | Plain class or module                             | Composable function (`use*`)             | Plain class or module                    |
| `injectVault()`                                                                    | Direct Vault API from `@sdux-vault/core`          | Direct Vault API from `@sdux-vault/core` | Direct Vault API from `@sdux-vault/core` |
| `@FeatureCell` decorator                                                           | Not used — configure via core API                 | Not used — configure via core API        | Not used — configure via core API        |
| `provideFeatureCell(Service, config, behaviors[], controllers[])`                  | `FeatureCell(config, behaviors[], controllers[])` | Same as React                            | Same as React                            |
| Pipeline fluent API (`.filters()`, `.reducers()`, `.withDelay()`, `.initialize()`) | Same fluent API                                   | Same fluent API                          | Same fluent API                          |
| `state.value()` signal                                                             | Reactive subscription or `useSyncExternalStore`   | `ref` / `computed`                       | Svelte store or `$state` rune            |

The pipeline configuration (filters, reducers, interceptors) is framework-agnostic
and should be translated 1:1. Only the reactive wrapper changes.

### Step 7 — Port the component logic

Translate the Angular `ExampleComponent` to the target framework:

| Angular Pattern                  | React                      | Vue                     | Svelte                  |
| -------------------------------- | -------------------------- | ----------------------- | ----------------------- |
| `signal()`                       | `useState()`               | `ref()`                 | `$state()` rune         |
| `computed()`                     | `useMemo()`                | `computed()`            | `$derived()` rune       |
| `inject(Service)`                | Import and instantiate     | `inject()` or import    | Import and instantiate  |
| `inject(DestroyRef).onDestroy()` | `useEffect` cleanup return | `onUnmounted()`         | `onDestroy()`           |
| `(click)="method()"`             | `onClick={method}`         | `@click="method"`       | `on:click={method}`     |
| `@if / @else`                    | Ternary / `&&` in JSX      | `v-if` / `v-else`       | `{#if}` / `{:else}`     |
| `{{ value \| json }}`            | `JSON.stringify(value)`    | `JSON.stringify(value)` | `JSON.stringify(value)` |

### Step 8 — Port the template

Translate the Angular HTML template to the target framework's template syntax.
Preserve the same UI structure, CSS class names, and visual layout.

### Step 9 — Copy shared utilities

Framework-agnostic files (e.g., `elapsed-timer.ts`) are copied verbatim into
the target example's `src/app/` directory with no modifications.

### Step 10 — Update package.json

- Set `name` to `<framework>-<example-short-name>` (e.g., `react-interceptor-delay`)
- Set `version` to `0.0.1`
- Include `@sdux-vault/core: "latest"` in dependencies
- Include `@sdux-vault/addons: "latest"` if the Angular example uses addons
- Do NOT include `@sdux-vault/core-extensions-angular` — that is Angular-only
- Match framework deps to the scaffolding template versions

---

## Quality Checks

Before finalizing, verify:

- [ ] All pipeline configuration matches the Angular example exactly
- [ ] All UI interactions (buttons, displays) are present and functional
- [ ] All framework-agnostic utilities are copied verbatim
- [ ] CSS class names match the Angular example for style consistency
- [ ] No Angular-specific APIs remain (`@Component`, `signal()`, `inject()`, etc.)
- [ ] The example runs standalone with its own `package.json`
- [ ] All JSDoc from the Angular example is preserved in the ported code
- [ ] All new and ported code follows the `@stackdocs` canon (`.github/prompts/stackdocs.prompt.md`)

---

## Documentation Requirements

- All JSDoc documentation present in the Angular example MUST be carried over
  to the ported example. Translate Angular-specific references (e.g., "Angular
  signal", "inject()") to the target framework equivalent, but preserve the
  instructional content, architectural callouts, and flow descriptions.
- Any new code introduced during porting (e.g., framework-specific hooks,
  composables, or adapters) MUST be documented following the `@stackdocs` canon.
- Framework-agnostic utilities copied verbatim retain their existing JSDoc as-is.

---

## Import Structure

- Preserve the same npm package import boundaries as the Angular example.
  Each npm package (`@sdux-vault/core`, `@sdux-vault/addons`, etc.) must have
  its own import statement — do NOT merge symbols from different packages into
  a single import line.
- If the Angular example imports `withDelayController` from `@sdux-vault/addons`,
  the ported example must also import it from `@sdux-vault/addons`, not from
  `@sdux-vault/core`.

---

## Prohibitions

- Do NOT modify the Angular source example
- Do NOT add features not present in the Angular example
- Do NOT change pipeline configuration (filters, reducers, interceptors must be identical)
- Do NOT introduce framework-specific state management libraries (no Redux, Pinia, ngrx, etc.)
- Do NOT expose SDuX Vault internals (see stackdocs.prompt.md § 1.4.1)
