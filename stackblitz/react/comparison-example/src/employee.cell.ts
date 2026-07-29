import { FeatureCell, Vault } from '@sdux-vault/react';
import { Employee } from './employee.model';

Vault({
  logLevel: 'off'
});

/**
 * Holds employee state and exposes the fluent pipeline used by this example.
 * The filter removes even identifiers, and the reducer sorts the remaining
 * records by name before the cell publishes the processed array.
 *
 * ⚠️ Architectural Boundary:
 * State updates are routed through the exported functions below so consumers
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
 * @returns Nothing; consumers observe the result through the FeatureCell snapshot.
 */
export function replaceEmployees(employees: Employee[]): void {
  employeeCell.replaceState({
    value: employees
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
 * @returns Nothing; consumers observe the reset through the cell snapshot.
 */
export function resetEmployees(): void {
  employeeCell.reset();
}
