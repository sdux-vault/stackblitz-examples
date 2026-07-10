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
   * Sample dataset used to demonstrate state replacement.
   */
  sample = [
    { id: 11, name: 'Luke', lastName: 'Skywalker' },
    { id: 38, name: 'Leia', lastName: 'Organa' },
    { id: 9, name: 'Han', lastName: 'Solo' }
  ];

  /**
   * Hint text describing the current active state, shown to guide the reader
   * through the example. The initial text reflects the `initialState` value
   * seeded by the FeatureCell on `initialize()` — a pre-populated character
   * record configured at registration time.
   */
  readonly activeStateHint = signal(
    'initialState configured at registration time.'
  );

  /** Whether to display the active state hint. */
  readonly displayActiveStateHint = signal(true);

  /**
   * Delegate a full state replacement to the FeatureCell service.
   *
   * The component does NOT mutate state directly.
   * Instead, it forwards the intent to the service,
   * which owns the Vault and pipeline configuration.
   *
   * Architectural Flow:
   * Button Click
   *   → Component method
   *   → Service method
   *   → Vault update
   *   → Pipeline execution
   *   → Reactive UI refresh
   */
  loadSample(): void {
    this.displayActiveStateHint.set(false);
    this.activeStateHint.set('State updated with sample data.');
    this.#exampleService.replace(this.sample);
  }

  /**
   * Delegates a state clear to the FeatureCell service.
   *
   * This calls `reset()` on the underlying FeatureCell, which clears state to
   * `undefined` \u2014 it does NOT restore the `initialState` configured at
   * registration. To return to a specific value, use the replace flow instead.
   *
   * @returns void
   */
  resetState(): void {
    this.#exampleService.reset();
  }
}
