import { FeatureCell, Vault } from '@sdux-vault/svelte';
import { of } from 'rxjs';

export interface Example {
  id: number;
  name: string;
  lastName: string;
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
  devMode: false
});

// Register the FeatureCell at module scope
export const exampleCell = FeatureCell<Example[]>({
  key: 'example-feature-cell-key',
  initialState: []
});

// Initialize the pipeline
exampleCell.initialize();

/**
 * Replaces the entire FeatureCell state using a deferred promise factory.
 *
 * The value is wrapped in a factory function so that promise execution
 * is deferred until the Resolve stage invokes it. This ensures the
 * promise resolves inside the pipeline under orchestration control.
 */
/**
 * Replaces the entire FeatureCell state using an Observable.
 *
 * The value is wrapped in an RxJS Observable using of(). The Resolve
 * stage detects the Observable, subscribes once via firstValueFrom(),
 * and resolves the emitted value through the pipeline.
 */
export function replaceExamples(input: Example[]): void {
  exampleCell.replaceState(of(input));
}

/** Resets the FeatureCell state to its initial value. */
export function resetExamples(): void {
  exampleCell.reset();
}
