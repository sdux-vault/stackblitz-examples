import { FeatureCell, Vault } from '@sdux-vault/core';

export interface Example {
  id: number;
  name: string;
  lastName: string;
}

// Initialize the Vault once at application startup
Vault({ logLevel: 'off' });

// Register the FeatureCell at module scope
const exampleCell = FeatureCell<Example[]>({
  key: 'example-feature-cell-key',
  initialState: []
});

// Initialize the pipeline
exampleCell.initialize();

// Expose read-only state access
export const exampleState = exampleCell.state;
export const exampleState$ = exampleCell.state$;

/** Replaces the entire FeatureCell state with the provided input. */
export function replaceExamples(input: Example[]): void {
  exampleCell.replaceState({
    loading: false,
    value: input,
    error: null
  });
}

/** Resets the FeatureCell state to its initial value. */
export function resetExamples(): void {
  exampleCell.reset();
}
