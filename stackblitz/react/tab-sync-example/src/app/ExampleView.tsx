import { ChangeEvent, useEffect, useState } from 'react';
import {
  Example,
  exampleCell,
  initializeCell,
  replaceExamples,
  resetExamples
} from './example.cell';
import './ExampleView.css';

/**
 * Sample datasets used to demonstrate state replacement and cross-tab sync.
 */
const samples: Example[][] = [
  [
    { id: 11, name: 'Luke', lastName: 'Skywalker' },
    { id: 38, name: 'Leia', lastName: 'Organa' },
    { id: 9, name: 'Han', lastName: 'Solo' }
  ],
  [
    { id: 22, name: 'Anakin', lastName: 'Skywalker' },
    { id: 44, name: 'Padmé', lastName: 'Amidala' },
    { id: 66, name: 'Obi-Wan', lastName: 'Kenobi' }
  ],
  [
    { id: 77, name: 'Din', lastName: 'Djarin' },
    { id: 88, name: 'Ahsoka', lastName: 'Tano' },
    { id: 99, name: 'Bo-Katan', lastName: 'Kryze' }
  ]
];

/**
 * UI component for the Tab Sync example.
 *
 * This component consumes the Vault-backed state exposed by example.cell
 * and demonstrates cross-tab state synchronization. When state is updated
 * in one tab, the withTabSyncStateBehavior broadcasts the finalized snapshot
 * to other tabs via BroadcastChannel.
 *
 * The component does not manage state directly — it delegates all state
 * updates and lifecycle orchestration to the FeatureCell module.
 */
export function ExampleView() {
  const snapshot = exampleCell.useSyncExternalStore();
  const [activeSample, setActiveSample] = useState<Example[]>(samples[0]);
  const [activeStateHint, setActiveStateHint] = useState(
    'Initial value is [] (empty array)'
  );
  const [displayActiveStateHint, setDisplayActiveStateHint] = useState(true);

  /**
   * Subscribes to state emissions then initializes the FeatureCell.
   *
   * Initialization is deferred so the subscription is guaranteed to
   * be active before the Tab Sync controller begins BroadcastChannel
   * negotiation. This ensures the component catches the negotiation
   * snapshot that is committed synchronously via commitState.
   */
  useEffect(() => {
    initializeCell();
  }, []);

  /**
   * Loads the active sample into the FeatureCell pipeline.
   *
   * When Tab Sync is enabled, the pipeline broadcasts the
   * finalized snapshot to all other tabs via BroadcastChannel.
   *
   * Architectural Flow:
   * Button Click
   *   → Component handler
   *   → Cell replaceState
   *   → Vault update
   *   → Pipeline execution
   *   → BroadcastChannel broadcast
   *   → Reactive UI refresh (all tabs)
   */
  function loadSample() {
    setDisplayActiveStateHint(false);
    setActiveStateHint('State updated and broadcast to all tabs.');
    replaceExamples(activeSample);
  }

  /** Resets the FeatureCell state to its initial value. */
  function handleResetState() {
    resetExamples();
  }

  /** Updates the active sample when the dropdown selection changes. */
  function handleSampleChange(event: ChangeEvent<HTMLSelectElement>) {
    const index = Number(event.target.value);
    setActiveSample(samples[index]);
  }

  return (
    <div className="example-container">
      <div className="header">
        <div className="title">React - SDuX Vault Tab Sync Example</div>
        <div className="subtitle">
          This example demonstrates cross-tab state synchronization. Open this
          page in two browser tabs — updating state in one tab automatically
          propagates the change to the other via BroadcastChannel.
        </div>
      </div>

      <div className="section">
        <div className="label">Tab Sync Flow</div>
        <div className="flow-hint">Tab A → BroadcastChannel → Tab B</div>
      </div>

      <div className="section">
        <div className="state-container">
          <label className="label" htmlFor="sample-select">
            Sample Dataset
          </label>
          <div className="hint">
            Choose a character group to use as input state. Selecting a dataset
            updates the input preview — click Load &amp; Sync State to apply it.
          </div>
          <div className="hint">
            <select
              id="sample-select"
              className="sdux-select"
              onChange={handleSampleChange}>
              {samples.map((sample, index) => (
                <option key={index} value={index}>
                  {sample[0].name} {sample[0].lastName}, {sample[1].name}{' '}
                  {sample[1].lastName}, {sample[2].name} {sample[2].lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="section column">
        <div className="state-container">
          <div className="label">Input State</div>
          <div className="hint">Data to replace and broadcast across tabs</div>
          <div className="hint file">
            <span className="emphasis">File:</span> app/ExampleView.tsx
          </div>
          <textarea
            className="data-textarea"
            readOnly
            value={JSON.stringify(activeSample, null, 2)}
          />
        </div>

        <div className="state-container data-row">
          <div className="label">Synced FeatureCell State</div>
          <div className="hint">State synchronized across tabs</div>
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
            Load &amp; Sync State
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
            href="https://www.sdux-vault.com/docs/pipeline/behaviors/tab-sync"
            target="_blank"
            rel="noopener noreferrer">
            Tab Sync
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
