import { FeatureCell, Vault } from '@sdux-vault/core';
import type { InsightConfig } from '@sdux-vault/shared';

export interface Example {
  id: number;
  name: string;
  lastName: string;
  jedi?: boolean;
  senator?: boolean;
}

// Initialize the Vault once at application startup
Vault({
  /**
   * Controls the verbosity of internal logging.
   * Levels: `'debug' | 'info' | 'warn' | 'error' | 'off'`.
   * Set to `'debug'` during development to trace pipeline activity.
   */
  logLevel: 'off',

  /**
   * Enables development-mode diagnostics.
   * When `true`, the SDuX Debugger panel and Chrome Extension
   * receive real-time pipeline trace events.
   */
  devMode: true
});

// Register the FeatureCell at module scope
const exampleCell = FeatureCell<Example[]>({
  key: 'example-feature-cell-key',
  initialState: [],

  // Insights enable the debugger to capture runtime telemetry for this
  // FeatureCell. Each flag controls what data the debugger records:
  //
  //   wantsErrors     — Capture error signals emitted during pipeline execution.
  //   wantsPayload    — Capture operation payloads for each pipeline event.
  //   wantsState      — Capture full state snapshots (can produce large exports).
  //   wantsCandidates — Capture pipeline candidate snapshots for state diff analysis.
  //
  // At minimum, enable wantsErrors and wantsPayload for useful debug sessions.
  insights: {
    wantsErrors: true,
    wantsPayload: true,
    wantsState: false,
    wantsCandidates: true
  } as InsightConfig
});

// Configure the pipeline: filters → reducers → initialize
exampleCell
  .filters([
    (examples: Example[]) =>
      examples.filter((example) => example.name !== 'Han')
  ])
  .reducers([
    (examples: Example[]) => {
      return examples.filter((example: Example) => {
        if (example.id === 11) {
          example.jedi = true;
        }
        example.senator = example.id === 38;
        return example;
      });
    }
  ])
  .initialize();

// Expose read-only state access
export const exampleState = exampleCell.state;
export const exampleState$ = exampleCell.state$;

/** Replaces the entire FeatureCell state with the provided input. */
export function replaceExamples(input: Example[]): void {
  exampleCell.replaceState({
    loading: false,
    value: input,
    error: null
  });
}

/** Resets the FeatureCell state to its initial value. */
export function resetExamples(): void {
  exampleCell.reset();
}

/** Toggles the loading flag on the current state. */
export function toggleLoading(loading: boolean): void {
  exampleCell.replaceState({
    loading,
    value: exampleState.value
  });
}

/** Toggles the error state between an Error instance and null. */
export function toggleError(error: Error | null): void {
  exampleCell.replaceState({
    error,
    value: exampleState.value
  });
}
