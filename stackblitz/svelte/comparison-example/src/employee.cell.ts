import { FeatureCell, Vault } from '@sdux-vault/svelte';
import type { Employee } from './employee.model';

Vault({
  logLevel: 'off'
});

/**
 * Holds employee state and exposes the filter and reducer pipeline used by the
 * Svelte comparison example.
 *
 * ⚠️ Architectural Boundary:
 * State changes are routed through the exported functions below so consumers
 * use the configured cell rather than mutating state directly.
 */
export const employeeCell = FeatureCell<Employee[]>({
  key: 'employees',
  initialState: []
});

employeeCell
  .filters([
    (examples: Employee[]) => examples.filter((example) => example.id % 2 !== 0)
  ])
  .reducers([
    (examples: Employee[]) => {
      examples.sort((left, right) => left.name.localeCompare(right.name));
      return examples;
    }
  ])
  .initialize();

/**
 * Replaces the current employee state and sends it through the pipeline.
 *
 * @param employees - Records to filter, sort, and publish as state.
 * @returns Nothing; the Svelte view observes the resulting snapshot.
 */
export function replaceEmployees(employees: Employee[]): void {
  employeeCell.replaceState({
    loading: false,
    value: employees,
    error: null
  });
}

/**
 * Starts an asynchronous employee-state update from the example API.
 *
 * @returns Nothing; the snapshot reports loading, success, or error state.
 */
export function replaceEmployeesAsync(): void {
  employeeCell.replaceState({
    value: () =>
      fetch('https://jsonplaceholder.typicode.com/users').then((response) =>
        response.json()
      )
  });
}

/**
 * Restores the FeatureCell's configured empty-array state.
 *
 * @returns Nothing; the view observes the reset through the cell state.
 */
export function resetEmployees(): void {
  employeeCell.reset();
}
