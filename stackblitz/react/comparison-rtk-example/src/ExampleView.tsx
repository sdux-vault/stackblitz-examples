import {
  replaceEmployees,
  replaceEmployeesAsync,
  resetEmployees
} from './employee.actions';
import { useGetEmployeesState } from './employee.api';
import type { Employee } from './employee.model';
import './ExampleView.css';

/** Supplies records for the synchronous replacement path so the query cache can demonstrate its transformation pipeline. */
const sample: Employee[] = [
  { id: 11, name: 'Luke' },
  { id: 38, name: 'Leia' },
  { id: 9, name: 'Han' }
];

/** Renders the query state and exposes the three state transitions demonstrated by this comparison example. */
export function ExampleView() {
  const snapshot = useGetEmployeesState();

  /** Sends the sample records through the filtering and sorting transformation before displaying them. */
  const loadSample = () => {
    replaceEmployees(sample);
  };

  /** Starts the remote request and lets the query state expose loading, success, or error results. */
  const loadSampleAsync = () => {
    replaceEmployeesAsync();
  };

  /** Clears the query cache and returns the displayed collection to its initial state. */
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
            value={JSON.stringify(snapshot.data ?? [], null, 2)}
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
