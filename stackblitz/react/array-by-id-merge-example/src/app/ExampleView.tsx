import { useState } from 'react';
import {
  Example,
  exampleCell,
  deleteExamples,
  mergeExamples,
  resetExamples
} from './example.cell';
import './ExampleView.css';

/** Entity records used to demonstrate ID-based updates, additions, and deletion. */
const sample: Example[] = [
  { id: 66, name: 'Darth', lastName: 'Vader' },
  { id: 38, name: 'Padme', lastName: 'Naberrie' },
  { id: 9, name: 'Han', lastName: 'Solo' }
];

/**
 * Root component for the array-by-ID merge example.
 *
 * Subscribes to the FeatureCell state observable and re-renders whenever
 * the pipeline commits a new snapshot. Each merge updates the matching Darth
 * record and adds Padme and Han; the delete action removes Han by ID.
 * The component does NOT mutate state directly — all updates are delegated
 * to the cell module to preserve the service boundary pattern.
 *
 * @returns The rendered React example view.
 */
export function ExampleView() {
  const snapshot = exampleCell.useSyncExternalStore();
  const [activeStateHint, setActiveStateHint] = useState(
    'initialState seeded on initialize() — click Merge Sample Data to update or add records.'
  );
  const [displayActiveStateHint, setDisplayActiveStateHint] = useState(true);

  /**
   * Delegates an ID-based entity merge to the FeatureCell cell module.
   *
   * Calls `mergeExamples`, which passes the sample records through the
   * `withArrayByIdMergeBehavior`. Darth is updated by ID, while Padme and Han
   * are added, triggering a reactive UI refresh.
   *
   * @returns void
   */
  function loadSample() {
    setDisplayActiveStateHint(false);
    setActiveStateHint(
      'Sample data merged — Darth was updated while Padme and Han were added.'
    );
    mergeExamples(sample);
  }

  /**
   * Removes Han by sending his record to the cell with the delete option.
   *
   * The configured behavior matches Han's `id` and removes only that entity,
   * leaving the other records in the current state unchanged.
   *
   * @returns void
   */
  function deleteHan() {
    setDisplayActiveStateHint(false);
    setActiveStateHint('Han was removed by ID using the delete option.');
    deleteExamples([sample[2]]);
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
          React - SDuX Vault Array By ID Merge Example
        </div>
        <div className="subtitle">
          This example demonstrates mergeState with the
          withArrayByIdMergeBehavior. Each merge compares incoming records by
          their <code>id</code>, updating matching entries and adding new ones.
          Delete Han removes the record with ID 9 without affecting the others.
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
            Merge Sample Data
          </button>

          <button className="sdux-button warn" onClick={deleteHan}>
            Delete Han
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
            href="https://www.sdux-vault.com/docs/pipeline/addons/merge/with-array-by-id-merge-behavior"
            target="_blank"
            rel="noopener noreferrer">
            withArrayByIdMerge Behavior
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
