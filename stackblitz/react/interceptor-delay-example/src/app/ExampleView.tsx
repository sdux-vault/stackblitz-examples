import { useEffect, useRef, useState } from 'react';
import { ElapsedTimer } from './elapsed-timer';
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

/**
 * Renders the FeatureCell state example with delay interceptor visualization.
 *
 * This component demonstrates how the `.withDelay()` interceptor holds
 * state updates for a configured duration before releasing them into
 * the pipeline. A real-time elapsed timer shows the delay window.
 */
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
  const [timerDisplay, setTimerDisplay] = useState('0.000');

  /** Framework-agnostic elapsed timer instance. */
  const timerRef = useRef<ElapsedTimer | null>(null);
  if (!timerRef.current) {
    timerRef.current = new ElapsedTimer((ms) =>
      setTimerDisplay(ElapsedTimer.format(ms))
    );
  }

  useEffect(() => {
    const sub = exampleState$.subscribe((emit) => {
      setSnapshot({
        value: emit.snapshot.value,
        isLoading: emit.snapshot.isLoading,
        error: emit.snapshot.error,
        hasValue: emit.snapshot.hasValue
      });
    });
    return () => {
      sub.unsubscribe();
      timerRef.current?.destroy();
    };
  }, []);

  const hasError = snapshot.error !== null;

  /**
   * Loads sample data into the FeatureCell pipeline.
   *
   * The data enters the delay interceptor and is held for 3 seconds
   * before being released to the output state. The elapsed timer
   * starts to visualize the hold window.
   */
  function loadSample() {
    setDisplayActiveStateHint(false);
    setActiveStateHint(
      'State updated with sample data after filters and reducers run.'
    );
    replaceExamples(sample);
    timerRef.current?.start();
  }

  /** Resets the FeatureCell state to its initial value. */
  function handleResetState() {
    resetExamples();
    timerRef.current?.reset();
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
        <div className="title">SDuX Example</div>
        <div className="subtitle">
          This example shows how SDUX processes state through a pipeline: input
          data flows through filters and reducers before becoming the final
          FeatureCell state.
        </div>
      </div>

      <div className="section">
        <div className="label">Flow</div>
        <div className="flow-hint">Input → Interceptor → Output</div>
      </div>

      <div className="section column">
        <div className="state-container">
          <div className="label">Delay (Interceptor)</div>
          <div className="hint">
            Removes or blocks data before it enters the pipeline
          </div>
          <div className="hint file">
            <span className="emphasis">File:</span> app/example.cell.ts
          </div>
          <textarea
            className="textarea"
            readOnly
            defaultValue={`.withDelay?.({ millisecondDelay: 3_000 })`}
          />
        </div>

        <div className="state-container">
          <div className="label">Delay Timer</div>
          <div className="hint">
            All data is held for 3 seconds before entering the pipeline
          </div>
          <div className="hint file"></div>
          <textarea className="textarea" readOnly value={`${timerDisplay}s`} />
        </div>
      </div>

      <div className="section column">
        <div className="state-container">
          <div className="label">Input State</div>
          <div className="hint">Raw data before processing</div>
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
          <div className="hint">Final state after filters and reducers run</div>
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
    </div>
  );
}
