import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ExampleService } from './example.service';

/**
 * UI component responsible for rendering the example FeatureCell state.
 *
 * This component consumes the Vault-backed state exposed by ExampleService
 * and reacts to its value, loading, and error signals.
 *
 * The component does not manage state directly — it delegates all state
 * updates and lifecycle orchestration to the FeatureCell service.
 */
@Component({
  selector: 'example-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'example.component.html',
  styleUrls: ['../styles.scss', 'example.component.scss']
})
export class ExampleComponent {
  /**
   * Injected FeatureCell service.
   *
   * This provides access to the Vault instance and all
   * runtime pipeline behavior configured in the service.
   */
  #exampleService = inject(ExampleService);

  /**
   * Reactive StateSnapshotShape<T> accessor exposed by the Vault.
   *
   * Provides reactive access to:
   * - value()
   * - hasValue()
   *
   * The template binds directly to these signals for rendering.
   *
   * Components may read from state,
   * but must call service methods to modify it.
   */
  state = this.#exampleService.state;

  /**
   * Sample dataset used to demonstrate promise-based state resolution.
   */
  sample = [
    { id: 11, name: 'Luke', lastName: 'Skywalker' },
    { id: 38, name: 'Leia', lastName: 'Organa' },
    { id: 9, name: 'Han', lastName: 'Solo' }
  ];

  /** Hint text describing the current active state. */
  readonly activeStateHint = signal('Initial value is [] (empty array)');

  /** Whether to display the active state hint. */
  readonly displayActiveStateHint = signal(true);

  /**
   * Delegates a promise-based state update to the FeatureCell service.
   *
   * The component does NOT mutate state directly.
   * Instead, it forwards the intent to the service,
   * which wraps the value in a deferred promise factory.
   * The Resolve stage invokes the factory and resolves
   * the promise before committing state.
   *
   * Architectural Flow:
   * Button Click
   *   → Component method
   *   → Service method (deferred factory)
   *   → Vault update
   *   → Resolve stage (promise resolution)
   *   → Pipeline execution
   *   → Reactive UI refresh
   */
  loadSample(): void {
    this.displayActiveStateHint.set(false);
    this.activeStateHint.set('State updated via deferred promise.');
    this.#exampleService.replace(this.sample);
  }

  /**
   * Resets the FeatureCell state to its initial value.
   */
  resetState(): void {
    this.#exampleService.reset();
  }
}
