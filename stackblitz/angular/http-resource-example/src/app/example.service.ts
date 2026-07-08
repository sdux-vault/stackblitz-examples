import { httpResource } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { FeatureCell, injectVault } from '@sdux-vault/angular';

/**
 * Shape representing a single user returned by the JSONPlaceholder API.
 */
export interface Example {
  /** Unique identifier for the user. */
  id: number;

  /** Full name of the user. */
  name: string;

  /** Username handle. */
  username: string;

  /** Email address. */
  email: string;
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
  readonly #injector = inject(Injector);

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
   * Configures the Vault runtime pipeline with filters, reducers,
   * and finalizes the FeatureCell initialization.
   */
  constructor() {
    // Runtime pipeline configuration
    this.#vault
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
   * Fetches users from a remote API using Angular's httpResource.
   *
   * The httpResource reference is passed directly to replaceState().
   * The Resolve stage detects the HttpResourceRef, subscribes to its
   * value signal, and resolves the response through the pipeline.
   */
  loadFromApi(): void {
    console.log('loadFromApi called');
    this.#vault.replaceState(
      httpResource<Example[]>(
        () => 'https://jsonplaceholder.typicode.com/users',
        { injector: this.#injector }
      )
    );
  }

  /**
   * Resets the FeatureCell state to its initial value.
   */
  reset(): void {
    this.#vault.reset();
  }
}
