<script lang="ts">
  import type { Employee } from './employee.model';
  import {
    employeeCell,
    replaceEmployees,
    replaceEmployeesAsync,
    resetEmployees
  } from './employee.cell';

  /** Records used to demonstrate filtering and alphabetical reduction. */
  const sample: Employee[] = [
    { id: 11, name: 'Luke' },
    { id: 38, name: 'Leia' },
    { id: 9, name: 'Han' }
  ];

  /** Reactive FeatureCell snapshot consumed by the Svelte template. */
  let snapshot = $derived(employeeCell.state);

  /**
   * Sends the sample records through the configured pipeline.
   *
   * @returns Nothing; the derived snapshot updates after the state change.
   */
  function loadSample(): void {
    replaceEmployees(sample);
  }

  /**
   * Requests employee data through the asynchronous FeatureCell update.
   *
   * @returns Nothing; the snapshot reflects loading and settlement state.
   */
  function loadSampleAsync(): void {
    replaceEmployeesAsync();
  }

  /**
   * Restores the FeatureCell to its initial empty-array state.
   *
   * @returns Nothing; the derived snapshot reflects the reset.
   */
  function resetState(): void {
    resetEmployees();
  }
</script>

<div class="example-container">
  <div>
    {#if snapshot.isLoading}
      <div>Loading...</div>
    {:else if snapshot.error}
      <div>{String(snapshot.error)}</div>
    {:else}
      <textarea class="textarea" readonly
        >{JSON.stringify(snapshot.value ?? [], null, 2)}</textarea>
    {/if}
  </div>

  <div class="actions">
    <button type="button" class="sdux-button" on:click={loadSample}>
      Load Sample State
    </button>

    <button type="button" class="sdux-button" on:click={loadSampleAsync}>
      Load Async State
    </button>

    <button type="button" class="sdux-button" on:click={resetState}>
      Reset State
    </button>
  </div>
</div>
