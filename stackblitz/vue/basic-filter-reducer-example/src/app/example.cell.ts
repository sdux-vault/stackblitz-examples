import { FeatureCell, Vault } from '@sdux-vault/core';

export interface Example {
  id: number;
  name: string;
  lastName: string;
  jedi?: boolean;
  senator?: boolean;
}

// Initialize the Vault once at application startup
Vault({ logLevel: 'off' });

// Register the FeatureCell at module scope
const exampleCell = FeatureCell<Example[]>({
  key: 'example-feature-cell-key',
  initialState: []
});

// Configure the pipeline: filters → reducers → initialize
exampleCell
  .filters([
    (examples: Example[]) =>
      examples.filter((example) => example.name !== 'Han')
  ])
  .reducers([
    (examples: Example[]) => {
      return examples.filter((example: Example) => {
        if (example.id === 11) {
          example.jedi = true;
        }
        example.senator = example.id === 38;
        return example;
      });
    }
  ])
  .initialize();

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

/** Toggles the loading flag on the current state. */
export function toggleLoading(loading: boolean): void {
  exampleCell.replaceState({
    loading,
    value: exampleState.value
  });
}

/** Toggles the error state between an Error instance and null. */
export function toggleError(error: Error | null): void {
  exampleCell.replaceState({
    error,
    value: exampleState.value
  });
}
