import { Injectable } from '@angular/core';
import { FeatureCell, injectVault } from '@sdux-vault/angular';

/**
 * Defines one character record stored in the example's array state.
 * The hydration factory and later replacement use the same shape.
 */
export interface Example {
  /** Identifies the character within the FeatureCell array. */
  id: number;

  /** Stores the character's first name for display. */
  name: string;

  /** Stores the character's last name for display. */
  lastName: string;
}

/**
 * Owns the FeatureCell that demonstrates deferred initialization with `hydrate()`.
 * The factory is registered before `initialize()` and resolves the authoritative
 * initial value at initialization time. Consumers receive reactive state while
 * mutations remain behind service methods. ⚠️ Architectural Boundary:
 * The Vault handle stays private so components cannot bypass this service.
 */
@FeatureCell<Example[]>('example-feature-cell-key')
@Injectable({ providedIn: 'root' })
export class ExampleService {
  /**
   * Provides the private FeatureCell handle used to configure hydration and
   * perform updates. ⚠️ Architectural Boundary: Consumers use the public state
   * snapshot and service methods instead of accessing this handle.
   */
  readonly #vault = injectVault<Example[]>(ExampleService);

  /**
   * Exposes reactive `value()`, `isLoading()`, `error()`, and `hasValue()`
   * signals so consumers can render the hydrated snapshot without mutating it.
   */
  readonly state = this.#vault.state;

  /**
   * Registers a Promise-based deferred factory and then initializes the FeatureCell.
   * `hydrate()` waits for `initialize()` before resolving the authoritative initial
   * value, which is then processed through the configured state pipeline.
   */
  constructor() {
    // Runtime pipeline configuration
    this.#vault
      .hydrate(() =>
        Promise.resolve([{ id: 1, name: 'Darth', lastName: 'Sidious' }])
      )
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
   * Replaces the entire hydrated state with a caller-provided character array.
   * The replacement travels through the same active pipeline and updates observers.
   * @param input - Character records that become the next FeatureCell value.
   * @returns void
   */
  replace(input: Example[]): void {
    this.#vault.replaceState({
      loading: false,
      value: input,
      error: null
    });
  }

  /**
   * Clears the FeatureCell snapshot without rerunning its hydration factory.
   * The initialized pipeline remains active for later replacements.
   * @returns void
   */
  reset(): void {
    this.#vault.reset();
  }
}
