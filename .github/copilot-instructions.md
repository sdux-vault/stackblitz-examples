**CRITICAL GUARDRAILS:**

- AI models are NEVER allowed to autonomously commit or push to git repositories. The user must always review changes and execute git operations manually via terminal commands.
- AI models are NEVER allowed to install npm packages without explicit user authorization.

Repository structure awareness:

- npm workspaces are scoped to `stackblitz/angular/demo-*` only. Do not add other directories as workspaces or create `package.json` files outside of `stackblitz/<framework>/<example-name>/` paths.
- Angular examples under `stackblitz/angular/` are the canonical source of truth. React, Vue, and Svelte examples are ports. Never modify Angular examples as part of a porting operation.
- Each StackBlitz example must be self-contained and runnable standalone. No cross-example imports or shared dependencies between examples.
- The `app/` directory is a local development playground — not a published example. Do not treat it as a StackBlitz example or include it in workspaces.
- The `tools/` directory contains `.mjs` scaffolding scripts that auto-discover frameworks by directory convention. Do not modify these scripts without understanding the discovery mechanism in `tools/global.mjs` and `tools/scaffold.mjs`.
- Do not expose SDuX Vault internal mechanics (voting, traces, revotes, deny/abstain, queue/timer internals) in example code, comments, or documentation. See `stackdocs.prompt.md` § 1.4.1.

Repository baseline defaults for this repository:

- Primary source language is TypeScript; prefer `.ts` for new source files unless explicitly requested otherwise.
- Existing JavaScript entrypoints and scripts (`.mjs`) are valid; do not migrate JS to TS unless explicitly requested.
- Documentation standard is JSDoc following the `@stackdocs` canon (`.github/prompts/stackdocs.prompt.md`).
- Use repository npm scripts as canonical commands for lint, build, and test.
- Maintain strict typing; avoid `any` and `unknown` unless explicitly requested.
- If instructions conflict with older docs, prioritize `package.json` scripts and current project config.

Prompt routing policy:

- Keep this file focused on repository guardrails, coding defaults, and shortcut routing.
- Prefer dedicated prompt files under `.github/prompts/` for task-specific procedures.
- Prompt files in `.github/prompts/` in this repository take precedence over identically named prompt files in the user's global prompts folder (`~/Library/Application Support/Code/User/prompts/`).
- When both exist, always follow the repository-local version.
- Treat all text after a recognized shortcut as the workflow payload unless the shortcut behavior says otherwise.
- If a workflow references a canon/rules prompt instead of a dedicated task prompt, follow that canon and keep behavior constrained to the stated workflow.

Shortcut routing:

- `@port` | `port example` | `port to react` | `port to vue` | `port to svelte`
  Use `.github/prompts/port-example.prompt.md`.
  Translates an Angular StackBlitz example to the target framework.

- `@gitcmd` | `git command` | `commit command` | `summarize commit` | `commit summary command`
  Use `.github/prompts/git-command.prompt.md`.

- `@gitfix` | `git fix` | `commit fix` | `verified commit`
  Use `.github/prompts/git-commit-fix.prompt.md`.

- `@gitreview` | `git review` | `pre-commit review` | `commit risk review`
  Use `.github/prompts/git-review.prompt.md`.

- `@markdown` | `markdown shortcut` | `convert to markdown`
  Use `.github/prompts/markdown.prompt.md`.

- `@help` | `shortcut help` | `list shortcuts`
  Use `.github/prompts/shortcut-help.prompt.md`.

- `@thanks` | `thanks shortcut` | `thank you shortcut`
  Use `.github/prompts/thanks.prompt.md`.

Documentation workflows:

- `@stackdocs` | `stackblitz docs` | `document stackblitz file`
  Use `.github/prompts/stackdocs.prompt.md` as the documentation canon.
  Instructional tone — teaches the reader what is happening and why.
  May reference `state/libs/` and `vault-engine/lib/src/` source for accuracy.
