import { ApplicationConfig } from '@angular/core';
import {
  provideFeatureCell,
  provideVault
} from '@sdux-vault/core-extensions-angular';
import { ExampleService } from './example.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideVault({ logLevel: 'off' }),
    provideFeatureCell(ExampleService, {
      key: 'example-feature-cell-key',
      initialValue: []
    })
  ]
};
