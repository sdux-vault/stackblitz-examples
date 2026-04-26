import { ApplicationConfig } from '@angular/core';
import { withDelayController } from '@sdux-vault/addons';
import {
  provideFeatureCell,
  provideVault
} from '@sdux-vault/core-extensions-angular';
import { ExampleService } from './example.service';

/**
 * Application-level configuration for the Angular standalone bootstrap.
 *
 * Registers the Vault runtime and the ExampleService FeatureCell
 * as dependency injection providers.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Creates the Vault runtime (state container + lifecycle)
    provideVault({ logLevel: 'off' }),

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
      ],
      [
        withDelayController
        // --> Register add-on controllers here <--
      ]
    )
  ]
};
