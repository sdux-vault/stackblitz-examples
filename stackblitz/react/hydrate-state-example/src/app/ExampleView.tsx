import { useState } from 'react';
import {
  Example,
  exampleCell,
  replaceExamples,
  resetExamples
} from './example.cell';
import './ExampleView.css';

/** Supplies a contrasting dataset used to replace the hydrated value. */
const sample: Example[] = [
  { id: 11, name: 'Luke', lastName: 'Skywalker' },
  { id: 38, name: 'Leia', lastName: 'Organa' },
  { id: 9, name: 'Han', lastName: 'Solo' }
];

/**
 * Renders the value produced by the cell's deferred hydration factory.
 * The component subscribes through `useSyncExternalStore()` and lets the reader
 * replace or clear that value after initialization. State changes are delegated
 * to the cell module so rendering stays separate from pipeline ownership.
 * @returns The React interface for exploring hydrated state.
 */
export function ExampleView() {
  /**
   * Subscribes React to the FeatureCell and exposes its current immutable snapshot.
   * Changes to the hydrated value cause React to render the latest state.
   */
  const snapshot = exampleCell.useSyncExternalStore();

  /** Describes whether the visible value came from hydration or a later update. */
  const [activeStateHint, setActiveStateHint] = useState(
    'hydrate() factory resolved during initialize().'
  );

  /** Controls whether the view identifies the hydrated value's source file. */
  const [displayActiveStateHint, setDisplayActiveStateHint] = useState(true);

  /**
   * Replaces the hydrated value with the sample dataset through the cell module.
   * The button click updates the pipeline and the external-store subscription
   * refreshes this component with the next snapshot.
   * @returns void
   */
  function loadSample() {
    setDisplayActiveStateHint(false);
    setActiveStateHint('State updated with sample data.');
    replaceExamples(sample);
  }

  /**
   * Clears the current value without running the hydration factory again.
   * Hydration belongs to initialization, so reset leaves the FeatureCell empty.
   * @returns void
   */
  function handleResetState() {
    resetExamples();
  }

  return (
    <div className="example-container">
      <div className="header">
        <div className="title">React - SDuX Vault Hydrate State Example</div>
        <div className="subtitle">
          This example demonstrates hydrate() — a deferred factory supplies the
          authoritative initial FeatureCell value when initialize() runs. The
          resolved value then travels through the normal state pipeline.
        </div>
      </div>

      <div className="section">
        <div className="label">FeatureCell Flow</div>
        <div className="flow-hint">
          Deferred factory → initialize() → pipeline → reactive state
        </div>
      </div>

      <div className="section column">
        <div className="state-container">
          <div className="label">Next State</div>
          <div className="hint">
            Sample data for a later replaceState() update
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
          <div className="label">Hydrated FeatureCell State</div>
          <div className="hint">Factory result after initialization</div>
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
            Replace Hydrated State
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
            href="https://www.sdux-vault.com/docs/pipeline/apis/feature-cell-api/hydrate-method"
            target="_blank"
            rel="noopener noreferrer">
            hydrate()
          </a>
          <span className="separator">·</span>
          <a
            href="https://www.sdux-vault.com/docs/pipeline/apis/feature-cell-api/initialize-method"
            target="_blank"
            rel="noopener noreferrer">
            initialize()
          </a>
          <span className="separator">·</span>
          <a
            href="https://www.sdux-vault.com/docs/pipeline/apis/provide-feature-cell"
            target="_blank"
            rel="noopener noreferrer">
            FeatureCell
          </a>
        </div>
      </div>
    </div>
  );
}
