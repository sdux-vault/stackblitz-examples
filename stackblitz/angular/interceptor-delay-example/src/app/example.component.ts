import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ElapsedTimer } from './elapsed-timer';
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
   * - isLoading()
   * - error()
   * - hasValue()
   *
   * The template binds directly to these signals for rendering.
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

  /** Hint text describing the current active state. */
  readonly activeStateHint = signal('Initial value is [] (empty array)');

  /** Whether to display the active state hint. */
  readonly displayActiveStateHint = signal(true);

  /** Whether the loading toggle is active. */
  readonly isLoading = signal(false);

  /** Whether the error state is currently set. */
  readonly hasError = computed<boolean>(() => this.state.error() !== null);

  /** Elapsed timer display value. */
  readonly timerDisplay = signal('0.000');

  /** Framework-agnostic elapsed timer instance. */
  readonly #timer = new ElapsedTimer((ms) =>
    this.timerDisplay.set(ElapsedTimer.format(ms))
  );

  /** Registers a DestroyRef callback to clean up the elapsed timer on component teardown. */
  constructor() {
    inject(DestroyRef).onDestroy(() => this.#timer.destroy());
  }

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
    this.activeStateHint.set(
      'State updated with sample data after filters and reducers run.'
    );
    this.#exampleService.replace(this.sample);
    this.#timer.start();
  }

  /**
   * Resets the FeatureCell state to its initial value.
   */
  resetState(): void {
    this.#exampleService.reset();
    this.#timer.reset();
  }

  /**
   * Toggles the loading flag and updates the service state.
   */
  toggleLoading(): void {
    this.isLoading.update((loading) => !loading);
    this.#exampleService.toggleLoading(this.isLoading());
  }

  /**
   * Toggles the error state between an Error instance and null.
   */
  toggleError(): void {
    const error = this.hasError() ? null : new Error('Example error message');
    this.#exampleService.toggleError(error);
  }
}
