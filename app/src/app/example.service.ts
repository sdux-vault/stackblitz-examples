import { Injectable } from '@angular/core';
import { FeatureCell, injectVault } from '@sdux-vault/core-extensions-angular';

/**
 * Shape representing a single example entity in the FeatureCell state.
 */
export interface Example {
  /** Unique identifier for the example entry. */
  id: number;

  /** First name of the character. */
  name: string;

  /** Last name of the character. */
  lastName: string;

  /** Whether the character is a Jedi, set by the jediReducer. */
  jedi?: boolean;

  /** Whether the character is a Senator, set by the jediReducer. */
  senator?: boolean;
  // TODO - add more fields to demonstrate filter/reducer behavior
}

/**
 * FeatureCell service for the 'example-feature-cell-key' state.
 *
 * This service owns the Vault-backed state and applies
 * runtime pipeline behaviors configured via the Vault fluent API.
 */
@FeatureCell<Example[]>('example-feature-cell-key')
@Injectable({ providedIn: 'root' })
export class ExampleService {
  /**
   * Internal Vault handle for this FeatureCell.
   *
   * ⚠️ Architectural Boundary:
   * The Vault instance is owned exclusively by this service.
   * Components must NEVER access the Vault directly.
   *
   * This ensures:
   * - Centralized state mutation
   * - Controlled pipeline configuration
   * - Proper lifecycle management
   * - Clear separation of concerns
   *
   * All state updates must go through service methods.
   */
  readonly #vault = injectVault<Example[]>(ExampleService);

  /**
   * Public reactive state snapshot exposed to consumers.
   *
   * This is the ONLY surface components should use.
   *
   * Provides read-only reactive access to:
   * - value()
   * - isLoading()
   * - error()
   * - hasValue()
   *
   * Components may read from state,
   * but must call service methods to modify it.
   */
  readonly state = this.#vault.state;

  /**
   * Configures the Vault runtime pipeline with a delay interceptor,
   * and finalizes the FeatureCell initialization.
   *
   * Pipeline execution order:
   *
   * 1. `.withDelay({ millisecondDelay: 3_000 })` — Holds all state
   *    updates for 3 seconds before releasing them into the pipeline.
   *    The UI will not reflect new data until the delay expires.
   *
   * 3. `.initialize()` — Locks the pipeline. No further behaviors can
   *    be registered after this call. State updates are only processed
   *    after initialization completes.
   */
  constructor() {
    // Runtime pipeline configuration
    this.#vault
      .withDelay?.({ millisecondDelay: 3_000 })
      // Finalizes configuration and activates the FeatureCell pipeline.
      //
      // After initialize() is called:
      //
      // - The pipeline structure becomes immutable
      // - No additional behaviors or operators may be registered
      // - All subsequent state updates flow through the configured pipeline
      //
      // No state updates will be processed before initialize() is called.
      .initialize();
  }

  /**
   * Replace the entire state synchronously.
   */
  replace(input: Example[]): void {
    this.#vault.replaceState({
      loading: false,
      value: input,
      error: null
    });
  }

  /**
   * Resets the FeatureCell state to its initial value.
   */
  reset(): void {
    this.#vault.reset();
  }

  /**
   * Toggles the loading flag on the current state.
   *
   * @param loading - Whether the state should indicate a loading status.
   */
  toggleLoading(loading: boolean): void {
    this.#vault.replaceState({
      loading,
      value: this.state.value()
    });
  }

  /**
   * Toggles the error state on the current FeatureCell.
   *
   * @param error - The error to set, or null to clear.
   */
  toggleError(error: Error | null): void {
    this.#vault.replaceState({
      error: error,
      value: this.state.value()
    });
  }
}
