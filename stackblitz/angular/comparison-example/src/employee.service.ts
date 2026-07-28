import { Injectable } from '@angular/core';
import { FeatureCell, injectVault } from '@sdux-vault/angular';
import { Employee } from './employee.model';

/**
 * Owns the employees FeatureCell and exposes its reactive state to the
 * component. The configured pipeline filters out even identifiers, sorts the
 * remaining records by name, and then publishes the processed array.
 *
 * ⚠️ Architectural Boundary:
 * The Vault handle remains private to this service. Components request state
 * changes through these methods so pipeline processing stays centralized.
 */
@FeatureCell<Employee[]>('employees')
@Injectable({ providedIn: 'root' })
export class EmployeeCell {
  /** Private Vault handle used to configure and update the FeatureCell. */
  readonly #vault = injectVault<Employee[]>(EmployeeCell);

  /** Reactive snapshot exposing the current value, loading, and error state. */
  readonly state = this.#vault.state;

  /** Configures the filter and reducer stages before activating the cell. */
  constructor() {
    this.#vault
      .filters([
        (examples: Employee[]) =>
          examples.filter((example) => example.id % 2 !== 0)
      ])
      .reducers([
        (examples: Employee[]) => {
          examples.sort((left, right) => left.name.localeCompare(right.name));
          return examples;
        }
      ])
      .initialize();
  }

  /**
   * Replaces the current employees and sends the input through the pipeline.
   *
   * @param employees - Records to filter, sort, and publish as state.
   * @returns Nothing; the resulting state is exposed through the reactive snapshot.
   */
  replace(employees: Employee[]): void {
    this.#vault.replaceState({
      loading: false,
      value: employees,
      error: null
    });
  }

  /**
   * Starts an asynchronous employee-state update from the example API.
   *
   * @returns Nothing; the Vault snapshot reports loading, success, or error state.
   */
  replaceAsync(): void {
    this.#vault.replaceState({
      value: () =>
        fetch('https://jsonplaceholder.typicode.com/users').then((response) =>
          response.json()
        )
    });
  }

  /**
   * Restores the FeatureCell's configured initial state.
   *
   * @returns Nothing; consumers observe the reset through the reactive snapshot.
   */
  reset(): void {
    this.#vault.reset();
  }
}
