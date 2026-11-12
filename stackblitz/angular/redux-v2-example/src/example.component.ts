import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { EmployeeStore } from './employee.service';

/** Renders employee state and delegates user actions to the NgRx SignalStore. */
@Component({
  selector: 'example-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent {
  /** Injected SignalStore that owns employee data and async resource state. */
  #employeeStore = inject(EmployeeStore);

  /** Reactive store signals consumed by the Angular template. */
  readonly state = this.#employeeStore;

  /** Sample records used to demonstrate synchronous store updates. */
  readonly sample = [
    { id: 11, name: 'Luke' },
    { id: 38, name: 'Leia' },
    { id: 9, name: 'Han' }
  ];

  /**
   * Sends the sample employees to the SignalStore for filtering and sorting.
   *
   * @returns Nothing; the template refreshes from the updated store state.
   */
  loadSample(): void {
    this.#employeeStore.replace(this.sample);
  }

  /**
   * Starts the httpResource request managed by the SignalStore.
   *
   * @returns Nothing; loading and settlement are reflected by the store signals.
   */
  loadSampleAsync(): void {
    void this.#employeeStore.replaceAsync();
  }

  /**
   * Restores the SignalStore to its empty initial state.
   *
   * @returns Nothing; the template observes the reset reactively.
   */
  resetState(): void {
    this.#employeeStore.reset();
  }
}
