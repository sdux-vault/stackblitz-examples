import {
  employeeCell,
  replaceEmployees,
  replaceEmployeesAsync,
  resetEmployees
} from './employee.cell';
import { Employee } from './employee.model';
import './ExampleView.css';

/** Records used to demonstrate filtering and alphabetical reduction. */
const sample: Employee[] = [
  { id: 11, name: 'Luke' },
  { id: 38, name: 'Leia' },
  { id: 9, name: 'Han' }
];

/**
 * Renders the employee snapshot and provides controls for the three state
 * transitions demonstrated by the example: replacement, async loading, and reset.
 *
 * @returns The interactive React view for the comparison example.
 */
export function ExampleView() {
  /** Reactive snapshot exposed by the FeatureCell's external-store hook. */
  const snapshot = employeeCell.useSyncExternalStore();

  /**
   * Sends the sample records through the configured filter and reducer stages.
   *
   * @returns Nothing; the subscribed snapshot updates after the state change.
   */
  const loadSample = () => {
    replaceEmployees(sample);
  };

  /**
   * Requests employee data through the asynchronous FeatureCell update.
   *
   * @returns Nothing; the snapshot reflects loading and settlement state.
   */
  const loadSampleAsync = () => {
    replaceEmployeesAsync();
  };

  /**
   * Restores the FeatureCell to its initial empty-array state.
   *
   * @returns Nothing; the subscribed snapshot reflects the reset.
   */
  const resetState = () => {
    resetEmployees();
  };

  return (
    <div className="example-container">
      A few changes to this React example from the original comparison example:
      <ol>
        <li>CSS styling</li>
        <li>
          Async fetch changed to "https://jsonplaceholder.typicode.com/users".
          Note: The live API causes a flash in the UI when the "Load Async
          State" button is clicked because there is a "Loading..." message
          displayed while the data is resolving. The API is too responsive to
          allow for reading the message.
        </li>
      </ol>
      <div>
        {snapshot.isLoading ? (
          <div>Loading...</div>
        ) : snapshot.error ? (
          <div>{String(snapshot.error)}</div>
        ) : (
          <textarea
            className="textarea"
            readOnly
            value={JSON.stringify(snapshot.value ?? [], null, 2)}
          />
        )}
      </div>
      <div className="actions">
        <button type="button" className="sdux-button" onClick={loadSample}>
          Load Sample State
        </button>

        <button type="button" className="sdux-button" onClick={loadSampleAsync}>
          Load Async State
        </button>

        <button type="button" className="sdux-button" onClick={resetState}>
          Reset State
        </button>
      </div>
    </div>
  );
}
