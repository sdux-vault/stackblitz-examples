import { FeatureCell, Vault } from '@sdux-vault/core';
import { of } from 'rxjs';

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

/**
 * Replaces the entire FeatureCell state using an Observable.
 *
 * The value is wrapped in an RxJS Observable using of(). The Resolve
 * stage detects the Observable, subscribes once via firstValueFrom(),
 * and resolves the emitted value through the pipeline.
 */
/**
 * Replaces the entire FeatureCell state using an Observable.
 *
 * The value is wrapped in an RxJS Observable using of(). The Resolve
 * stage detects the Observable, subscribes once via firstValueFrom(),
 * and resolves the emitted value through the pipeline.
 */
export function replaceExamples(input: Example[]): void {
  exampleCell.replaceState(of(input));
}

/** Resets the FeatureCell state to its initial value. */
export function resetExamples(): void {
  exampleCell.reset();
}
