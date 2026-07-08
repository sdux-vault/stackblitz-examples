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
    // Creates the Vault runtime (state container + lifecycle)
    provideVault({
      /**
       * Controls the verbosity of internal logging.
       * Levels: `'debug' | 'info' | 'warn' | 'error' | 'off'`.
       * Set to `'debug'` during development to trace pipeline activity.
       */
      logLevel: 'off',

      /**
       * Enables development-mode diagnostics.
       * When `true`, the SDuX Debugger panel and Chrome Extension
       * receive real-time pipeline trace events.
       */
      devMode: false
    }),

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
