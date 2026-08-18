<script setup lang="ts">
import { ref } from 'vue';
import {
  type Example,
  deleteExamples,
  exampleCell,
  mergeExamples,
  resetExamples
} from './example.cell';

const sample: Example[] = [
  { id: 66, name: 'Darth', lastName: 'Vader' },
  { id: 38, name: 'Padme', lastName: 'Amidala' },
  { id: 9, name: 'Han', lastName: 'Solo' }
];

const snapshot = exampleCell.useReactiveState();

const activeStateHint = ref(
  'initialState seeded on initialize() — click Merge Sample Data to update or add records.'
);
const displayActiveStateHint = ref(true);

/**
 * Delegates an array-by-ID merge to the FeatureCell cell module.
 *
 * Calls `mergeExamples`, which updates Darth because its ID already exists
 * and adds Padme and Han because their IDs are new.
 *
 * @returns void
 */
function loadSample(): void {
  displayActiveStateHint.value = false;
  activeStateHint.value =
    'Sample data merged — Darth was updated while Padme and Han were added.';
  mergeExamples(sample);
}

/**
 * Removes Han by passing his ID to the delete-aware merge flow.
 *
 * `withArrayByIdMergeBehavior` matches Han by `id` and removes that record
 * when `deleteExamples` sends the `isDelete` option.
 *
 * @returns void
 */
function deleteHan(): void {
  displayActiveStateHint.value = false;
  activeStateHint.value = 'Han was removed by ID using the delete option.';
  deleteExamples([sample[2]]);
}

/**
 * Clears the FeatureCell state to `undefined` by calling `resetExamples`.
 * This does NOT restore the `initialState` — to rebuild the list, use the
 * merge flow instead.
 *
 * @returns void
 */
function handleResetState(): void {
  resetExamples();
}
</script>

<template>
  <div class="example-container">
    <div class="header">
      <div class="title">Vue - SDuX Vault Array By ID Merge Example</div>
      <div class="subtitle">
        This example demonstrates mergeState with the
        withArrayByIdMergeBehavior. Records with matching IDs are updated,
        records with new IDs are added, and records can be removed by ID.
      </div>
    </div>

    <div class="section">
      <div class="label">FeatureCell Flow</div>
      <div class="flow-hint">Input → Output</div>
    </div>

    <div class="section column">
      <div class="state-container">
        <div class="label">Input State</div>
        <div class="hint">Raw data before processing</div>
        <div class="hint file">
          <span class="emphasis">File:</span> app/ExampleView.vue
        </div>
        <textarea
          class="data-textarea"
          readonly
          :value="JSON.stringify(sample, null, 2)" />
      </div>

      <div class="state-container data-row">
        <div class="label">FeatureCell State</div>
        <div class="hint">Final state</div>
        <div class="hint file">
          <span class="emphasis">File:</span> app/example.cell.ts
        </div>

        <template v-if="snapshot.hasValue">
          <textarea
            class="data-textarea"
            readonly
            :value="JSON.stringify(snapshot.value, null, 2)" />
          <div class="hint state">
            <span class="emphasis">State:</span> {{ activeStateHint }}
          </div>
          <div class="hint file">
            <template v-if="displayActiveStateHint">
              <span class="emphasis">File:</span> app/example.cell.ts
            </template>
            <template v-else>&nbsp;</template>
          </div>
        </template>

        <template v-else>
          <textarea class="data-textarea" readonly value=" " />
          <div class="hint state">
            <span class="emphasis">State:</span> cleared - pipeline has no
            active value for state.
          </div>
          <div class="hint file">
            <span class="emphasis">File:</span> app/example.cell.ts &nbsp;
          </div>
        </template>
      </div>
    </div>

    <div class="section">
      <div class="actions">
        <button type="button" class="sdux-button primary" @click="loadSample">
          Merge Sample Data
        </button>

        <button type="button" class="sdux-button warn" @click="deleteHan">
          Delete Han
        </button>

        <div class="secondary-actions">
          <button type="button" class="sdux-button" @click="handleResetState">
            Reset State
          </button>
        </div>
      </div>
    </div>

    <div class="section learn-more">
      <div class="label">Learn More</div>
      <div class="learn-more-links">
        <a
          href="https://www.sdux-vault.com/docs/pipeline/behaviors/state"
          target="_blank"
          rel="noopener noreferrer"
          >State</a
        >
        <span class="separator">·</span>
        <a
          href="https://www.sdux-vault.com/docs/pipeline/addons/merge/with-array-by-id-merge-behavior"
          target="_blank"
          rel="noopener noreferrer"
          >withArrayByIdMerge Behavior</a
        >
        <span class="separator">·</span>
        <a
          href="https://www.sdux-vault.com/docs/pipeline/behaviors/merge"
          target="_blank"
          rel="noopener noreferrer">
          Merging State
        </a>
        <span class="separator">·</span>
        <a
          href="https://www.sdux-vault.com/docs/pipeline/apis/feature-cell"
          target="_blank"
          rel="noopener noreferrer"
          >FeatureCell</a
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  height: 430px;
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
  height: 175px;
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

.learn-more {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.learn-more-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
}

.learn-more-links a {
  color: #555;
  text-decoration: none;
}

.learn-more-links a:hover {
  text-decoration: underline;
  color: #222;
}

.learn-more-links .separator {
  color: #ccc;
}
</style>
