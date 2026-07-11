import { useState } from 'react';
import {
  Example,
  exampleCell,
  replaceExamples,
  resetExamples
} from './example.cell';
import './ExampleView.css';

const sample: Example[] = [
  { id: 11, name: 'Luke', lastName: 'Skywalker' },
  { id: 38, name: 'Leia', lastName: 'Organa' },
  { id: 9, name: 'Han', lastName: 'Solo' }
];

/** Renders the FeatureCell promise resolve example. */
export function ExampleView() {
  const snapshot = exampleCell.useSyncExternalStore();
  const [activeStateHint, setActiveStateHint] = useState(
    'Initial value is [] (empty array)'
  );
  const [displayActiveStateHint, setDisplayActiveStateHint] = useState(true);

  /** Loads sample data into the FeatureCell via an RxJS Observable. */
  function loadSample() {
    setDisplayActiveStateHint(false);
    setActiveStateHint('State updated via Observable.');
    replaceExamples(sample);
  }

  /** Resets the FeatureCell state to its initial value. */
  function handleResetState() {
    resetExamples();
  }

  return (
    <div className="example-container">
      <div className="header">
        <div className="title">React - SDuX Vault Observable Example</div>
        <div className="subtitle">
          This example demonstrates replaceState with an RxJS Observable. The
          Resolve stage detects the Observable, subscribes once, and resolves
          the emitted value through the pipeline.
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
            Load Sample State
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
            href="https://www.sdux-vault.com/docs/pipeline/behaviors/resolve"
            target="_blank"
            rel="noopener noreferrer">
            Resolve Behaviors
          </a>
          <span className="separator">·</span>
          <a
            href="https://www.sdux-vault.com/docs/pipeline/addons/resolve/with-core-observable-behavior"
            target="_blank"
            rel="noopener noreferrer">
            Observable Resolve
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
