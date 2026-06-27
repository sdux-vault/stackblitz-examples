import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ExampleService } from './example.service';

/**
 * UI component for the Tab Sync example.
 *
 * This component consumes the Vault-backed state exposed by ExampleService
 * and demonstrates cross-tab state synchronization. When state is updated
 * in one tab, the withTabSyncStateBehavior broadcasts the finalized snapshot
 * to other tabs via BroadcastChannel.
 *
 * The component does not manage state directly — it delegates all state
 * updates and lifecycle orchestration to the FeatureCell service.
 */
@Component({
  selector: 'example-view',
  standalone: true,
  imports: [JsonPipe],
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
   * Sample datasets used to demonstrate state replacement.
   */
  samples = [
    [
      { id: 11, name: 'Luke', lastName: 'Skywalker' },
      { id: 38, name: 'Leia', lastName: 'Organa' },
      { id: 9, name: 'Han', lastName: 'Solo' }
    ],
    [
      { id: 22, name: 'Anakin', lastName: 'Skywalker' },
      { id: 44, name: 'Padmé', lastName: 'Amidala' },
      { id: 66, name: 'Obi-Wan', lastName: 'Kenobi' }
    ],
    [
      { id: 77, name: 'Din', lastName: 'Djarin' },
      { id: 88, name: 'Ahsoka', lastName: 'Tano' },
      { id: 99, name: 'Bo-Katan', lastName: 'Kryze' }
    ]
  ];

  /** Currently selected sample dataset. */
  readonly activeSample = signal(this.samples[0]);

  /** Hint text describing the current active state. */
  readonly activeStateHint = signal('Initial value is [] (empty array)');

  /** Whether to display the active state hint. */
  readonly displayActiveStateHint = signal(true);

  /**
   * Delegate a full state replacement to the FeatureCell service.
   *
   * The component does NOT mutate state directly.
   * Instead, it forwards the intent to the service,
   * which owns the Vault and pipeline configuration.
   *
   * When Tab Sync is enabled, the pipeline broadcasts the
   * finalized snapshot to all other tabs via BroadcastChannel.
   *
   * Architectural Flow:
   * Button Click
   *   → Component method
   *   → Service method
   *   → Vault update
   *   → Pipeline execution
   *   → BroadcastChannel broadcast
   *   → Reactive UI refresh (all tabs)
   */
  loadSample(): void {
    this.displayActiveStateHint.set(false);
    this.activeStateHint.set('State updated and broadcast to all tabs.');
    this.#exampleService.replace(this.activeSample());
  }

  /**
   * Updates the active sample when the dropdown selection changes.
   */
  onSampleChange(event: Event): void {
    const index = Number((event.target as HTMLSelectElement).value);
    this.activeSample.set(this.samples[index]);
  }

  /**
   * Resets the FeatureCell state to its initial value.
   */
  resetState(): void {
    this.#exampleService.reset();
  }
}
