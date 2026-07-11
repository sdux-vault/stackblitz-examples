import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ExampleService } from './example.service';

/**
 * Renders the value produced by the service's deferred hydration factory.
 * The component reads the reactive FeatureCell snapshot and lets the reader
 * replace or clear that value after initialization. ⚠️ Architectural Boundary:
 * State changes are delegated to ExampleService so the component never accesses
 * the Vault directly.
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
   * Provides the service-owned reactive state and mutation methods used by the view.
   */
  #exampleService = inject(ExampleService);

  /**
   * Exposes the read-only reactive snapshot whose `value()` and `hasValue()`
   * signals keep the template synchronized with the hydrated FeatureCell.
   */
  state = this.#exampleService.state;

  /**
   * Supplies a contrasting dataset used to replace the hydrated value.
   */
  sample = [
    { id: 11, name: 'Luke', lastName: 'Skywalker' },
    { id: 38, name: 'Leia', lastName: 'Organa' },
    { id: 9, name: 'Han', lastName: 'Solo' }
  ];

  /**
   * Describes whether the visible value came from hydration or a later update.
   */
  readonly activeStateHint = signal(
    'hydrate() factory resolved during initialize().'
  );

  /** Controls whether the template shows the source of the hydrated value. */
  readonly displayActiveStateHint = signal(true);

  /**
   * Replaces the hydrated value with the sample dataset through the service.
   * The button click delegates to `replace()`, the update crosses the pipeline,
   * and the reactive snapshot refreshes the template.
   * @returns void
   */
  loadSample(): void {
    this.displayActiveStateHint.set(false);
    this.activeStateHint.set('State updated with sample data.');
    this.#exampleService.replace(this.sample);
  }

  /**
   * Clears the current value without running the hydration factory again.
   * Hydration belongs to initialization, so reset leaves the FeatureCell empty.
   * @returns void
   */
  resetState(): void {
    this.#exampleService.reset();
  }
}
