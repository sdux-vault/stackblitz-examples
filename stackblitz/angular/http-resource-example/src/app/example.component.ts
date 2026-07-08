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

  /** Hint text describing the current active state. */
  readonly activeStateHint = signal('Initial value is [] (empty array)');

  /** Whether to display the active state hint. */
  readonly displayActiveStateHint = signal(true);

  /**
   * Delegates an httpResource-based state update to the FeatureCell service.
   *
   * The component does NOT mutate state directly.
   * Instead, it forwards the intent to the service,
   * which creates an httpResource reference. The Resolve stage
   * detects the HttpResourceRef, subscribes to its value signal,
   * and resolves the response through the pipeline.
   *
   * Architectural Flow:
   * Button Click
   *   → Component method
   *   → Service method (httpResource)
   *   → Vault update
   *   → Resolve stage (HttpResource resolution)
   *   → Pipeline execution
   *   → Reactive UI refresh
   */
  loadFromApi(): void {
    this.displayActiveStateHint.set(false);
    this.activeStateHint.set(
      'State loaded from JSONPlaceholder API via httpResource.'
    );
    this.#exampleService.loadFromApi();
  }

  /**
   * Resets the FeatureCell state to its initial value.
   */
  resetState(): void {
    this.#exampleService.reset();
  }
}
