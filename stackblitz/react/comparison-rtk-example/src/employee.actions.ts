import { employeeApi, prepareEmployees } from './employee.api';
import type { Employee } from './employee.model';
import { store } from './store';

/**
 * Replaces the cached collection after applying the same filter and sort transformation used by the remote response.
 *
 * @param employees Records to transform and place in the employee query cache.
 * @returns Nothing; subscribed query state updates from the cache write.
 */
export function replaceEmployees(employees: Employee[]): void {
  store.dispatch(
    employeeApi.util.upsertQueryData(
      'getEmployees',
      undefined,
      prepareEmployees(employees)
    )
  );
}

/**
 * Starts a fresh employee request through the RTK Query endpoint.
 *
 * @returns Nothing; the subscribed query state reports the request lifecycle.
 */
export function replaceEmployeesAsync(): void {
  void store.dispatch(
    employeeApi.endpoints.getEmployees.initiate(undefined, {
      forceRefetch: true,
      subscribe: false
    })
  );
}

/**
 * Clears the employee query cache so the view returns to its initial state.
 *
 * @returns Nothing; subscribed query state updates after the cache reset.
 */
export function resetEmployees(): void {
  store.dispatch(employeeApi.util.resetApiState());
}
