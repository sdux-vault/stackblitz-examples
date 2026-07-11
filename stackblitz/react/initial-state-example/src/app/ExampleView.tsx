import { useState } from 'react';
import { Example, exampleCell } from './example.cell';
import './ExampleView.css';

const sample: Example[] = [
  { id: 11, name: 'Luke', lastName: 'Skywalker' },
  { id: 38, name: 'Leia', lastName: 'Organa' },
  { id: 9, name: 'Han', lastName: 'Solo' }
];

/** Renders the FeatureCell initial state example. */
export function ExampleView() {
  const snapshot = exampleCell.useSyncExternalStore();
  const [activeStateHint, setActiveStateHint] = useState(
    'initialState configured at registration time.'
  );
  const [displayActiveStateHint, setDisplayActiveStateHint] = useState(true);

  /** Loads sample data into the FeatureCell. */
  function loadSample() {
    setDisplayActiveStateHint(false);
    setActiveStateHint('State updated with sample data.');
    exampleCell.replaceState({
      loading: false,
      value: sample,
      error: null
    });
  }

  /** Clears the FeatureCell state. Does NOT restore initialState. */
  function handleResetState() {
    exampleCell.reset();
  }

  return (
    <div className="example-container">
      <div className="header">
        <div className="title">React - SDuX Vault Initial State Example</div>
        <div className="subtitle">
          This example demonstrates initialState — a FeatureCell can be seeded
          with pre-populated state at registration time. The initialState is
          processed through the full pipeline on initialize() and is the
          lowest-precedence initialization source.
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
