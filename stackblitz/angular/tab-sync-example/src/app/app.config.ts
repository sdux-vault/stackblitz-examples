import { ApplicationConfig } from '@angular/core';
import { provideFeatureCell, provideVault } from '@sdux-vault/angular';
import {
  withTabSyncController,
  withTabSyncStateBehavior
} from '@sdux-vault/core';
import { ExampleService } from './example.service';

/**
 * Application-level configuration for the Tab Sync example.
 *
 * Registers the Vault runtime and the ExampleService FeatureCell
 * with cross-tab synchronization via withTabSyncStateBehavior
 * and withTabSyncController.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Creates the Vault runtime (state container + lifecycle)
    provideVault({ logLevel: 'off', devMode: true, bypassLicensing: true }),

    // Define a FeatureCell (state + behaviors + controllers)
    provideFeatureCell(
      // Service class that owns the FeatureCell instance
      ExampleService,

      // FeatureCell descriptor (identity + initial state)
      {
        // Unique state key used by the Vault
        key: 'example-feature-cell-key',

        // Fallback Initial value for the state
        initialState: []
      },

      // Optional definition-time extensions
      [
        // --> Register add-on behaviors here <--
        withTabSyncStateBehavior
      ],
      [
        // --> Register add-on controllers here <--
        withTabSyncController
      ]
    )
  ]
};
