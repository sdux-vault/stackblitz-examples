import { Injectable } from '@angular/core';
import { FeatureCell, injectVault } from '@sdux-vault/angular';

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
}

/**
 * FeatureCell service for the `example-feature-cell-key` state.
 *
 * This service owns the Vault-backed state and configures the array-by-ID merge
 * behavior through the fluent API. Components call the service methods to
 * update, delete, or reset state while the FeatureCell exposes reactive state
 * to the template.
 *
 * ⚠️ **Architectural Boundary:** The Vault handle remains private to this
 * service so state changes follow one documented application path.
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
   * Configures the identifier field and activates the FeatureCell pipeline.
   *
   * The `withArrayMergeId({ idKey: 'id' })` call tells the registered behavior
   * which property identifies an entity. Initialization then processes the
   * configured initial state, and later merges update matching IDs or add new
   * entities without replacing unrelated entries.
   */
  constructor() {
    // Runtime pipeline configuration
    this.#vault
      // Configure the property used to match existing entities during merges
      // and identify entities when the delete option is enabled.
      .withArrayMergeId?.({ idKey: 'id' })
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
   * Merges entity records into the current array by their `id` property.
   *
   * Existing IDs are updated with the incoming record, while new IDs are added
   * to the state. The request flows from this service through `mergeState()` and
   * the configured `withArrayByIdMergeBehavior` before the reactive state is
   * refreshed for consumers.
   *
   * @param input - Entity records to update or add to the current state.
   * @returns void
   */
  merge(input: Example[]): void {
    this.#vault.mergeState({
      value: input
    });
  }

  /**
   * Removes entity records whose IDs match the supplied records.
   *
   * The input is sent through the same array-by-ID merge behavior with the
   * `isDelete` option, so matching entities are removed while other state
   * entries remain unchanged.
   *
   * @param input - Entity records whose IDs should be removed from the state.
   * @returns void
   */
  delete(input: Example[]): void {
    this.#vault.mergeState(
      {
        value: input
      },
      {
        isDelete: true
      }
    );
  }

  /**
   * Clears the current FeatureCell value without destroying its pipeline.
   *
   * Resetting removes the active value rather than restoring the registered
   * initial state. Call `merge()` with entity records to build the array again.
   *
   * @returns void
   */
  reset(): void {
    this.#vault.reset();
  }
}
