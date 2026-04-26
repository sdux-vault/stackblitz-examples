<script lang="ts">
  import { onDestroy } from 'svelte';
  import { ElapsedTimer } from './elapsed-timer';
  import {
    type Example,
    exampleState,
    exampleState$,
    replaceExamples,
    resetExamples,
    toggleError,
    toggleLoading
  } from './example.cell';

  const sample: Example[] = [
    { id: 11, name: 'Luke', lastName: 'Skywalker' },
    { id: 38, name: 'Leia', lastName: 'Organa' },
    { id: 9, name: 'Han', lastName: 'Solo' }
  ];

  let snapshot = $state({
    value: exampleState.value,
    isLoading: exampleState.isLoading,
    error: exampleState.error as unknown | null,
    hasValue: exampleState.hasValue
  });

  let activeStateHint = $state('Initial value is [] (empty array)');
  let displayActiveStateHint = $state(true);
  let isLoading = $state(false);
  let timerDisplay = $state('0.000');

  /** Framework-agnostic elapsed timer instance. */
  const timer = new ElapsedTimer((ms) => {
    timerDisplay = ElapsedTimer.format(ms);
  });

  const sub = exampleState$.subscribe((emit) => {
    snapshot = {
      value: emit.snapshot.value,
      isLoading: emit.snapshot.isLoading,
      error: emit.snapshot.error,
      hasValue: emit.snapshot.hasValue
    };
  });

  onDestroy(() => {
    sub.unsubscribe();
    timer.destroy();
  });

  /**
   * Loads sample data into the FeatureCell pipeline.
   *
   * The data enters the delay interceptor and is held for 3 seconds
   * before being released to the output state. The elapsed timer
   * starts to visualize the hold window.
   */
  function loadSample(): void {
    displayActiveStateHint = false;
    activeStateHint =
      'State updated with sample data after filters and reducers run.';
    replaceExamples(sample);
    timer.start();
  }

  /** Resets the FeatureCell state to its initial value. */
  function handleResetState(): void {
    resetExamples();
    timer.reset();
  }

  /** Toggles the loading flag on the current state. */
  function handleToggleLoading(): void {
    const next = !isLoading;
    isLoading = next;
    toggleLoading(next);
  }

  /** Toggles the error state between an Error instance and null. */
  function handleToggleError(): void {
    const hasError = snapshot.error !== null;
    const error = hasError ? null : new Error('Example error message');
    toggleError(error);
  }

  const delayCode = `.withDelay?.({ millisecondDelay: 3_000 })`;
</script>

<div class="example-container">
  <div class="header">
    <div class="title">SDuX Example</div>
    <div class="subtitle">
      This example shows how SDUX processes state through a pipeline: input data
      flows through filters and reducers before becoming the final FeatureCell
      state.
    </div>
  </div>

  <div class="section">
    <div class="label">Flow</div>
    <div class="flow-hint">Input → Interceptor → Output</div>
  </div>

  <div class="section column">
    <div class="state-container">
      <div class="label">Delay (Interceptor)</div>
      <div class="hint">
        Removes or blocks data before it enters the pipeline
      </div>
      <div class="hint file">
        <span class="emphasis">File:</span> app/example.cell.ts
      </div>
      <textarea class="textarea" readonly>{delayCode}</textarea>
    </div>

    <div class="state-container">
      <div class="label">Delay Timer</div>
      <div class="hint">
        All data is held for 3 seconds before entering the pipeline
      </div>
      <div class="hint file"></div>
      <textarea class="textarea" readonly>{timerDisplay}s</textarea>
    </div>
  </div>

  <div class="section column">
    <div class="state-container">
      <div class="label">Input State</div>
      <div class="hint">Raw data before processing</div>
      <div class="hint file">
        <span class="emphasis">File:</span> app/ExampleView.svelte
      </div>
      <textarea class="data-textarea" readonly
        >{JSON.stringify(sample, null, 2)}</textarea>
    </div>

    <div class="state-container data-row">
      <div class="label">FeatureCell State</div>
      <div class="hint">Final state after filters and reducers run</div>
      <div class="hint file">
        <span class="emphasis">File:</span> app/example.cell.ts
      </div>

      {#if snapshot.isLoading}
        <div class="status">Loading...</div>
      {:else if snapshot.error}
        <textarea
          class="data-textarea error"
          readonly
          value={JSON.stringify(snapshot.error, null, 2)}></textarea>
        <div class="hint state">This is a VaultError display</div>
      {:else if snapshot.hasValue}
        <textarea
          class="data-textarea"
          readonly
          value={JSON.stringify(snapshot.value, null, 2)}></textarea>
        <div class="hint state">
          <span class="emphasis">State:</span>
          {activeStateHint}
        </div>
        <div class="hint file">
          {#if displayActiveStateHint}
            <span class="emphasis">File:</span> app/example.cell.ts
          {:else}
            &nbsp;
          {/if}
        </div>
      {:else}
        <textarea class="data-textarea" readonly value=" "></textarea>
        <div class="hint state">
          <span class="emphasis">State:</span> cleared - pipeline has no active value,
          error or loading status.
        </div>
        <div class="hint file">
          <span class="emphasis">File:</span> app/example.cell.ts &nbsp;
        </div>
      {/if}
    </div>
  </div>

  <div class="section">
    <div class="actions">
      <button type="button" class="sdux-button primary" onclick={loadSample}>
        Load Sample State
      </button>

      <div class="secondary-actions">
        <button type="button" class="sdux-button" onclick={handleResetState}>
          Reset State
        </button>
        <button type="button" class="sdux-button" onclick={handleToggleLoading}>
          Loading ({String(snapshot.isLoading)})
        </button>
        <button type="button" class="sdux-button" onclick={handleToggleError}>
          Error ({String(snapshot.error !== null)})
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .example-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .title {
    font-size: 2rem;
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .subtitle {
    font-size: 1rem;
    color: #666;
    max-width: 600px;
  }

  .section {
    padding: 1rem;
  }

  .section.column {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    display: flex;
    gap: 0.75rem;
  }

  @media (max-width: 768px) {
    .section.column {
      flex-direction: column;
    }

    .section.column .state-container {
      width: 100%;
    }
  }

  .state-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
  }

  .state-container.data-row {
    height: 415px;
  }

  .textarea,
  .data-textarea {
    width: 100%;
    box-sizing: border-box;
    height: 300px;
    padding: 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 6px;
    font-family: monospace;
    font-size: 0.8rem;
    background: #fafafa;
    color: #222;
  }

  .data-textarea.error {
    color: #d33;
  }

  .textarea {
    height: 75px;
  }

  .label {
    font-size: 1.1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #666;
  }

  .flow-hint {
    margin-top: 0.25rem;
    font-size: 1rem;
    letter-spacing: 0.3px;
    color: #666;
  }

  .hint {
    font-size: 1rem;
    color: #777;
    margin-top: -0.15rem;
    margin-left: 0.5rem;
  }

  .hint.file {
    min-height: 16px;
    color: #999;
    font-family: monospace;
    font-size: 0.9rem;
  }

  .hint.state {
    margin-top: 0.15rem;
  }

  .emphasis {
    font-weight: 600;
    color: #555;
  }

  .actions {
    justify-content: flex-start;
    display: flex;
    align-items: center;
    gap: 3rem;
  }

  @media (max-width: 768px) {
    .actions {
      flex-direction: column;
      align-items: flex-start;
      gap: 2rem;
    }
  }

  .secondary-actions {
    display: flex;
    gap: 2rem;
  }

  @media (max-width: 768px) {
    .secondary-actions {
      gap: 1.5rem;
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .status {
    height: 300px;
    font-size: 0.85rem;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
