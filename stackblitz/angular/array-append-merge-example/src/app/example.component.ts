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
   * Sample dataset appended to the existing FeatureCell state on each merge.
   */
  sample = [
    { id: 11, name: 'Luke', lastName: 'Skywalker' },
    { id: 38, name: 'Leia', lastName: 'Organa' },
    { id: 9, name: 'Han', lastName: 'Solo' }
  ];

  /**
   * Hint text describing the current active state, shown to guide the reader
   * through the example. The initial text reflects the `initialState` value
   * seeded by the FeatureCell on `initialize()`. Each merge appends to the
   * existing array, growing the list without discarding previous entries.
   */
  readonly activeStateHint = signal(
    'initialState seeded on initialize() — click Append to grow the list.'
  );

  /** Whether to display the active state hint. */
  readonly displayActiveStateHint = signal(true);

  /**
   * Delegates an array append merge to the FeatureCell service.
   *
   * The component does NOT mutate state directly.
   * Instead, it forwards the intent to the service,
   * which owns the Vault and pipeline configuration.
   *
   * Architectural Flow:
   * Button Click
   *   → Component method
   *   → Service merge method
   *   → Vault mergeState
   *   → withArrayAppendMergeBehavior concatenates arrays
   *   → Pipeline execution
   *   → Reactive UI refresh
   *
   * @returns void
   */
  loadSample(): void {
    this.displayActiveStateHint.set(false);
    this.activeStateHint.set(
      'Sample data appended — new items joined the existing array.'
    );
    this.#exampleService.merge(this.sample);
  }

  /**
   * Delegates a state clear to the FeatureCell service.
   *
   * This calls `reset()` on the underlying FeatureCell, which clears state to
   * `undefined` \u2014 it does NOT restore the `initialState` configured at
   * registration. To return to a specific value, use the merge flow instead.
   *
   * @returns void
   */
  resetState(): void {
    this.#exampleService.reset();
  }
}
