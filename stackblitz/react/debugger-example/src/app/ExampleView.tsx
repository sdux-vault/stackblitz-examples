import { useEffect, useState } from 'react';
import {
  Example,
  exampleState,
  exampleState$,
  replaceExamples,
  resetExamples,
  toggleError,
  toggleLoading
} from './example.cell';
import './ExampleView.css';

const sample: Example[] = [
  { id: 11, name: 'Luke', lastName: 'Skywalker' },
  { id: 38, name: 'Leia', lastName: 'Organa' },
  { id: 9, name: 'Han', lastName: 'Solo' }
];

/** Renders the FeatureCell state example with filter and reducer pipeline visualization. */
export function ExampleView() {
  const [snapshot, setSnapshot] = useState({
    value: exampleState.value,
    isLoading: exampleState.isLoading,
    error: exampleState.error,
    hasValue: exampleState.hasValue
  });
  const [activeStateHint, setActiveStateHint] = useState(
    'Initial value is [] (empty array)'
  );
  const [displayActiveStateHint, setDisplayActiveStateHint] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const sub = exampleState$.subscribe((emit) => {
      setSnapshot({
        value: emit.snapshot.value,
        isLoading: emit.snapshot.isLoading,
        error: emit.snapshot.error,
        hasValue: emit.snapshot.hasValue
      });
    });
    return () => sub.unsubscribe();
  }, []);

  const hasError = snapshot.error !== null;

  /** Loads sample data into the FeatureCell pipeline. */
  function loadSample() {
    setDisplayActiveStateHint(false);
    setActiveStateHint(
      'State updated with sample data after filters and reducers run.'
    );
    replaceExamples(sample);
  }

  /** Resets the FeatureCell state to its initial value. */
  function handleResetState() {
    resetExamples();
  }

  /** Toggles the loading flag on the current state. */
  function handleToggleLoading() {
    const next = !isLoading;
    setIsLoading(next);
    toggleLoading(next);
  }

  /** Toggles the error state between an Error instance and null. */
  function handleToggleError() {
    const error = hasError ? null : new Error('Example error message');
    toggleError(error);
  }

  return (
    <div className="example-container">
      <div className="header">
        <div className="title">React - SDuX Vault Debugger Example</div>
        <div className="subtitle">
          This example demonstrates the SDuX Vault built-in debugger — a
          floating panel that captures pipeline execution traces. Record a
          session, trigger state changes, then export logs or generate an AI
          diagnostic report.
        </div>
      </div>

      <div className="section">
        <div className="label">Debugger Flow</div>
        <div className="flow-hint">
          Record → FeatureCell Activity → Stop → Download
        </div>
      </div>

      <div className="section column">
        <div className="state-container">
          <div className="label">1. Enable Dev Mode in Vault Definition</div>
          <div className="hint">
            The debugger is enabled via{' '}
            <span className="emphasis">devMode: true</span> in the Vault
            configuration. This example already has it enabled.
          </div>
          <div className="hint file">
            <span className="emphasis">File:</span> app/example.cell.ts
          </div>
          <textarea
            className="textarea"
            readOnly
            defaultValue={`Vault({
  devMode: true,
  logLevel: 'off'
})`}
          />
        </div>

        <div className="state-container">
          <div className="label">
            2. Add insights to the FeatureCell Definition
          </div>
          <div className="hint">
            <span className="emphasis">Insights</span> provide additional
            context for the debugger to capture during pipeline execution. This
            example already has insights enabled.
          </div>
          <div className="hint file">
            <span className="emphasis">File:</span> app/example.cell.ts
          </div>
          <textarea
            className="textarea"
            readOnly
            defaultValue={`FeatureCell({
  key: 'example-feature-cell-key',
  initialState: [],
  insights: {
    wantsErrors: true,
    wantsPayload: true,
    wantsState: false
  } as InsightConfig
})`}
          />
        </div>
      </div>

      <div className="section column">
        <div className="state-container">
          <div className="label">3. Record a Session</div>
          <div className="hint">
            To record a FeatureCell session, click the &quot;Record&quot;
            button, then trigger state changes by clicking &quot;Load Sample
            State&quot; in the UI. The debugger captures each pipeline event,
            including filter and reducer executions, state emissions, and any
            errors.
          </div>
          <div className="hint">
            After finishing all state changes, click &quot;Stop&quot; to end the
            recording session. You can then download the captured logs as a JSON
            file for analysis or use the AI Assist feature to generate an
            automated diagnostic report.
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Control</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Record / Stop</td>
                <td>Start or end a recording session</td>
              </tr>
              <tr>
                <td>Event Count</td>
                <td>Total captured pipeline events</td>
              </tr>
              <tr>
                <td>Error Count</td>
                <td>Captured error signals</td>
              </tr>
              <tr>
                <td>Clear</td>
                <td>Reset the current session</td>
              </tr>
              <tr>
                <td>Download Logs</td>
                <td>Export the debug dump (JSON)</td>
              </tr>
              <tr>
                <td>AI Assist</td>
                <td>Generate an AI diagnostic report</td>
              </tr>
              <tr>
                <td>Create Issue</td>
                <td>Generate a structured issue report</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <div className="hint">
          <strong>Note:</strong> This example uses a filter (removes
          &quot;Han&quot;) and a reducer (marks Jedi). See{' '}
          <span className="emphasis">app/example.cell.ts</span> for the pipeline
          configuration.
        </div>
      </div>

      <div className="section column">
        <div className="state-container">
          <div className="label">Input State</div>
          <div className="hint">
            Raw data before processing — click &quot;Load Sample State&quot; to
            trigger pipeline activity
          </div>
          <div className="hint file">
            <span className="emphasis">File:</span> app/ExampleView.tsx
          </div>
          <textarea
            className="data-textarea"
            readOnly
            defaultValue={JSON.stringify(sample, null, 2)}
          />
        </div>

        <div className="state-container data-row">
          <div className="label">FeatureCell State</div>
          <div className="hint">
            Final state after filters and reducers run — the debugger captures
            each pipeline stage
          </div>
          <div className="hint file">
            <span className="emphasis">File:</span> app/example.cell.ts
          </div>
          {snapshot.isLoading ? (
            <div className="status">Loading...</div>
          ) : snapshot.error ? (
            <>
              <textarea
                className="data-textarea error"
                readOnly
                value={JSON.stringify(snapshot.error, null, 2)}
              />
              <div className="hint state">This is a VaultError display</div>
            </>
          ) : snapshot.hasValue ? (
            <>
              <textarea
                className="data-textarea"
                readOnly
                value={JSON.stringify(snapshot.value, null, 2)}
              />
              <div className="hint state">
                <span className="emphasis">State:</span> {activeStateHint}
              </div>
              <div className="hint file">
                {displayActiveStateHint ? (
                  <>
                    <span className="emphasis">File:</span> app/example.cell.ts
                  </>
                ) : (
                  '\u00a0'
                )}
              </div>
            </>
          ) : (
            <>
              <textarea className="data-textarea" readOnly value=" " />
              <div className="hint state">
                <span className="emphasis">State:</span> cleared - pipeline has
                no active value, error or loading status.
              </div>
              <div className="hint file">
                <span className="emphasis">File:</span> app/example.cell.ts
                &nbsp;
              </div>
            </>
          )}
        </div>
      </div>

      <div className="section">
        <div className="actions">
          <button className="sdux-button primary" onClick={loadSample}>
            Load Sample State
          </button>

          <div className="secondary-actions">
            <button className="sdux-button" onClick={handleResetState}>
              Reset State
            </button>
            <button className="sdux-button" onClick={handleToggleLoading}>
              Loading ({String(snapshot.isLoading)})
            </button>
            <button className="sdux-button" onClick={handleToggleError}>
              Error ({String(hasError)})
            </button>
          </div>
        </div>
      </div>

      <div className="section learn-more">
        <div className="label">Learn More</div>
        <div className="learn-more-links">
          <a
            href="https://www.sdux-vault.com/docs/dev-tools/built-in-debugger"
            target="_blank"
            rel="noopener noreferrer">
            Debugger
          </a>
          <span className="separator">·</span>
          <a
            href="https://www.sdux-vault.com/docs/pipeline/behaviors/filters"
            target="_blank"
            rel="noopener noreferrer">
            Filters
          </a>
          <span className="separator">·</span>
          <a
            href="https://www.sdux-vault.com/docs/pipeline/behaviors/reducers"
            target="_blank"
            rel="noopener noreferrer">
            Reducers
          </a>
          <span className="separator">·</span>
          <a
            href="https://www.sdux-vault.com/docs/pipeline/apis/feature-cell"
            target="_blank"
            rel="noopener noreferrer">
            FeatureCell
          </a>
        </div>
      </div>
    </div>
  );
}
