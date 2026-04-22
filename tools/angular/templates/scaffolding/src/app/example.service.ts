import { Injectable } from '@angular/core';
import { FeatureCell, injectVault } from '@sdux-vault/core-extensions-angular';

export interface Example {
  // example attributes
  id: number;
  name: string;
  lastName: string;
  jedi?: boolean;
  senator?: boolean;
  // TODO: define additional properties
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

  readonly #jediReducer = (examples: Example[]) => {
    return examples.filter((example: Example) => {
      if (example.id === 11) {
        example.jedi = true;
      }

      example.senator = example.id === 38;

      return example;
    });
  };

  constructor() {
    // Runtime pipeline configuration
    this.#vault
      // Filters may block or allow updates to continue through the pipeline
      .filters([
        (examples: Example[]) =>
          examples.filter((example) => example.name !== 'Han')
      ])
      // Reducers transform the working state
      .reducers([this.#jediReducer])
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

  reset(): void {
    this.#vault.reset();
  }

  toggleLoading(loading: boolean): void {
    this.#vault.replaceState({
      loading,
      value: this.state.value()
    });
  }

  toggleError(error: Error | null): void {
    this.#vault.replaceState({
      error: error,
      value: this.state.value()
    });
  }
}
