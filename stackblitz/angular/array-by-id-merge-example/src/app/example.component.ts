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
   * This provides access to the reactive state and array-by-ID operations
   * configured by the service without exposing the Vault handle to the view.
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
   * Sample entity records used to demonstrate ID-based updates and additions.
   */
  sample = [
    { id: 66, name: 'Darth', lastName: 'Vader' },
    { id: 38, name: 'Padme', lastName: 'Naberrie' },
    { id: 9, name: 'Han', lastName: 'Solo' }
  ];

  /**
   * Hint text describing the current active state, shown to guide the reader
   * through the example. The initial text reflects the `initialState` value
   * seeded by the FeatureCell on `initialize()`. Each merge updates an entity
   * with a matching ID or adds a new entity without replacing unrelated entries.
   */
  readonly activeStateHint = signal(
    'initialState seeded on initialize() — click Append to grow the list.'
  );

  /** Whether to display the active state hint. */
  readonly displayActiveStateHint = signal(true);

  /**
   * Delegates an ID-based entity merge to the FeatureCell service.
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
   *   → withArrayByIdMergeBehavior updates matching IDs and adds new entities
   *   → Pipeline execution
   *   → Reactive UI refresh
   *
   * @returns void
   */
  loadSample(): void {
    this.displayActiveStateHint.set(false);
    this.activeStateHint.set(
      'Sample data appended and merged — Padme and Han joined the existing array while Anakin was merged into Darth Vader.'
    );
    this.#exampleService.merge(this.sample);
  }

  /**
   * Requests removal of Han from the FeatureCell by passing Han's record to the
   * service with the delete option. The configured array-by-ID behavior uses the
   * record's `id` to remove Han while preserving the other entities.
   *
   * @returns void
   */
  deleteHan(): void {
    this.displayActiveStateHint.set(false);
    this.activeStateHint.set('Han was removed by Id and the "delete" option.');
    this.#exampleService.delete([this.sample[2]]);
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
