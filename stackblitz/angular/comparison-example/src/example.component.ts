import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { EmployeeCell } from './employee.service';

/**
 * Renders the employees state and delegates user actions to EmployeeCell.
 * The template reads the cell's reactive snapshot to display loading, errors,
 * and the filtered and sorted employee value.
 */
@Component({
  selector: 'example-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent {
  /** Injected service that owns the employees FeatureCell and its pipeline. */
  #employeeCell = inject(EmployeeCell);

  /** Reactive state snapshot consumed by the Angular template. */
  readonly state = this.#employeeCell.state;

  /** Sample records used to demonstrate synchronous pipeline processing. */
  readonly sample = [
    { id: 11, name: 'Luke' },
    { id: 38, name: 'Leia' },
    { id: 9, name: 'Han' }
  ];

  /**
   * Sends the sample records to the FeatureCell for filtering and sorting.
   *
   * @returns Nothing; the template refreshes from the updated reactive state.
   */
  loadSample(): void {
    this.#employeeCell.replace(this.sample);
  }

  /**
   * Requests asynchronous state loading from the FeatureCell service.
   *
   * @returns Nothing; loading and settlement are reflected by the state snapshot.
   */
  loadSampleAsync(): void {
    this.#employeeCell.replaceAsync();
  }

  /**
   * Restores the FeatureCell's empty initial state.
   *
   * @returns Nothing; the template observes the reset reactively.
   */
  resetState(): void {
    this.#employeeCell.reset();
  }
}
