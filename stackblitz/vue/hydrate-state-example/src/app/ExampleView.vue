<script setup lang="ts">
import { ref } from 'vue';
import {
  type Example,
  exampleCell,
  replaceExamples,
  resetExamples
} from './example.cell';

/** Supplies a contrasting dataset used to replace the hydrated value. */
const sample: Example[] = [
  { id: 11, name: 'Luke', lastName: 'Skywalker' },
  { id: 38, name: 'Leia', lastName: 'Organa' },
  { id: 9, name: 'Han', lastName: 'Solo' }
];

/** Holds the reactive Vue view of the current FeatureCell snapshot. */
const snapshot = exampleCell.useReactiveState();

/** Describes whether the visible value came from hydration or a later update. */
const activeStateHint = ref('hydrate() factory resolved during initialize().');

/** Controls whether the template shows the source of the hydrated value. */
const displayActiveStateHint = ref(true);

/**
 * Replaces the hydrated value with the sample dataset through the cell module.
 * The button click updates the pipeline and Vue refreshes the template from
 * the reactive snapshot.
 * @returns void
 */
function loadSample(): void {
  displayActiveStateHint.value = false;
  activeStateHint.value = 'State updated with sample data.';
  replaceExamples(sample);
}

/**
 * Clears the current value without running the hydration factory again.
 * Hydration belongs to initialization, so reset leaves the FeatureCell empty.
 * @returns void
 */
function handleResetState(): void {
  resetExamples();
}
</script>

<template>
  <div class="example-container">
    <div class="header">
      <div class="title">Vue - SDuX Vault Hydrate State Example</div>
      <div class="subtitle">
        This example demonstrates hydrate() — a deferred factory supplies the
        authoritative initial FeatureCell value when initialize() runs. The
        resolved value then travels through the normal state pipeline.
      </div>
    </div>

    <div class="section">
      <div class="label">FeatureCell Flow</div>
      <div class="flow-hint">
        Deferred factory → initialize() → pipeline → reactive state
      </div>
    </div>

    <div class="section column">
      <div class="state-container">
        <div class="label">Next State</div>
        <div class="hint">Sample data for a later replaceState() update</div>
        <div class="hint file">
          <span class="emphasis">File:</span> app/ExampleView.vue
        </div>
        <textarea
          class="data-textarea"
          readonly
          :value="JSON.stringify(sample, null, 2)" />
      </div>

      <div class="state-container data-row">
        <div class="label">Hydrated FeatureCell State</div>
        <div class="hint">Factory result after initialization</div>
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
          Replace Hydrated State
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
          href="https://www.sdux-vault.com/docs/pipeline/apis/feature-cell-api/hydrate-method"
          target="_blank"
          rel="noopener noreferrer"
          >hydrate()</a
        >
        <span class="separator">·</span>
        <a
          href="https://www.sdux-vault.com/docs/pipeline/apis/feature-cell-api/initialize-method"
          target="_blank"
          rel="noopener noreferrer"
          >initialize()</a
        >
        <span class="separator">·</span>
        <a
          href="https://www.sdux-vault.com/docs/pipeline/apis/provide-feature-cell"
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
  font-family: monospace;
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
