import { useState } from 'react';
import {
  Example,
  exampleCell,
  mergeExamples,
  resetExamples
} from './example.cell';
import './ExampleView.css';

const sample: Example[] = [
  { id: 11, name: 'Luke', lastName: 'Skywalker' },
  { id: 38, name: 'Leia', lastName: 'Organa' },
  { id: 9, name: 'Han', lastName: 'Solo' }
];

/**
 * Root component for the array append merge example.
 *
 * Subscribes to the FeatureCell state observable and re-renders whenever
 * the pipeline commits a new snapshot. Each click of "Append Sample Data"
 * invokes `mergeExamples`, which passes the sample array through the
 * `withArrayAppendMergeBehavior`, concatenating it with the existing state.
 * The component does NOT mutate state directly — all updates are delegated
 * to the cell module to preserve the service boundary pattern.
 */
export function ExampleView() {
  const snapshot = exampleCell.useSyncExternalStore();
  const [activeStateHint, setActiveStateHint] = useState(
    'initialState seeded on initialize() — click Append to grow the list.'
  );
  const [displayActiveStateHint, setDisplayActiveStateHint] = useState(true);

  /**
   * Delegates an array append merge to the FeatureCell cell module.
   *
   * Calls `mergeExamples`, which passes the sample array through the
   * `withArrayAppendMergeBehavior`, concatenating it with the current
   * state and triggering a reactive UI refresh.
   *
   * @returns void
   */
  function loadSample() {
    setDisplayActiveStateHint(false);
    setActiveStateHint(
      'Sample data appended — new items joined the existing array.'
    );
    mergeExamples(sample);
  }

  /**
   * Clears the FeatureCell state to `undefined` by calling `resetExamples`.
   * This does NOT restore the `initialState` — to rebuild the list, use the
   * merge flow instead.
   *
   * @returns void
   */
  function handleResetState() {
    resetExamples();
  }

  return (
    <div className="example-container">
      <div className="header">
        <div className="title">
          React - SDuX Vault Array Append Merge Example
        </div>
        <div className="subtitle">
          This example demonstrates mergeState with the
          withArrayAppendMergeBehavior. Each append concatenates the incoming
          array with the existing state, growing the list without discarding
          previous entries.
        </div>
      </div>

      <div className="section">
        <div className="label">FeatureCell Flow</div>
        <div className="flow-hint">Input → Output</div>
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
          <div className="hint">Final state</div>
          <div className="hint file">
            <span className="emphasis">File:</span> app/example.cell.ts
          </div>
          {snapshot.hasValue ? (
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
                no active value for state.
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
            Append Sample Data
          </button>

          <div className="secondary-actions">
            <button className="sdux-button" onClick={handleResetState}>
              Reset State
            </button>
          </div>
        </div>
      </div>

      <div className="section learn-more">
        <div className="label">Learn More</div>
        <div className="learn-more-links">
          <a
            href="https://www.sdux-vault.com/docs/pipeline/behaviors/state"
            target="_blank"
            rel="noopener noreferrer">
            State
          </a>
          <span className="separator">·</span>
          <a
            href="https://www.sdux-vault.com/docs/pipeline/behaviors/state/updating"
            target="_blank"
            rel="noopener noreferrer">
            Updating State
          </a>
          <span className="separator">·</span>
          <a
            href="https://www.sdux-vault.com/docs/pipeline/behaviors/merge"
            target="_blank"
            rel="noopener noreferrer">
            Merging State
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
