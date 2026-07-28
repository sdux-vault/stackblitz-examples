<script setup lang="ts">
import {
  employeeCell,
  replaceEmployees,
  replaceEmployeesAsync,
  resetEmployees
} from './employee.cell';
import { Employee } from './employee.model';

/** Records used to demonstrate filtering and alphabetical reduction. */
const sample: Employee[] = [
  { id: 11, name: 'Luke' },
  { id: 38, name: 'Leia' },
  { id: 9, name: 'Han' }
];

/** Reactive FeatureCell snapshot consumed by the Vue template. */
const snapshot = employeeCell.useReactiveState();

/**
 * Sends the sample records through the configured pipeline.
 *
 * @returns Nothing; the reactive snapshot updates after the state change.
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
 * @returns Nothing; the reactive snapshot reflects the reset.
 */
function resetState(): void {
  resetEmployees();
}
</script>

<template>
  <div class="example-container">
    A few changes to this Vue example from the original comparison example:
    <ol>
      <li>CSS styling</li>
      <li>
        Async fetch changed to "https://jsonplaceholder.typicode.com/users".
        Note: The live API causes a flash in the UI when the "Load Async State"
        button is clicked because there is a "Loading..." message displayed
        while the data is resolving. The API is too responsive to allow for
        reading the message.
      </li>
    </ol>
    <div>
      <div v-if="snapshot.isLoading">Loading...</div>
      <div v-else-if="snapshot.error" v-text="String(snapshot.error)" />
      <textarea
        v-else
        class="textarea"
        readonly
        :value="JSON.stringify(snapshot.value ?? [], null, 2)" />
    </div>

    <div class="actions">
      <button type="button" class="sdux-button" @click="loadSample">
        Load Sample State
      </button>

      <button type="button" class="sdux-button" @click="loadSampleAsync">
        Load Async State
      </button>

      <button type="button" class="sdux-button" @click="resetState">
        Reset State
      </button>
    </div>
  </div>
</template>
