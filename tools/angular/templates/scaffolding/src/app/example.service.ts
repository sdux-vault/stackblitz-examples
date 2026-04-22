import { Injectable } from '@angular/core';
import { FeatureCell, injectVault } from '@sdux-vault/core-extensions-angular';

export interface Example {
  id: number;
  name: string;
}

@FeatureCell<Example[]>('example-feature-cell-key')
@Injectable({ providedIn: 'root' })
export class ExampleService {
  readonly #vault = injectVault();
}
