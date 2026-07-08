import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideFeatureCell, provideVault } from '@sdux-vault/angular';
import { ExampleService } from './example.service';

/**
 * Application-level configuration for the Angular standalone bootstrap.
 *
 * Registers the Vault runtime and the ExampleService FeatureCell
 * as dependency injection providers.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Angular HttpClient required for httpResource
    provideHttpClient(),

    // Creates the Vault runtime (state container + lifecycle)
    provideVault({ logLevel: 'off', devMode: true }),

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
        // --> Register add-on controllers here <--
      ]
    )
  ]
};
