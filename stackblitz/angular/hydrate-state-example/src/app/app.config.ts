import { ApplicationConfig } from '@angular/core';
import { provideFeatureCell, provideVault } from '@sdux-vault/angular';
import { ExampleService } from './example.service';

/**
 * Application-level configuration for the Angular standalone bootstrap.
 *
 * Registers the Vault runtime and the ExampleService FeatureCell with Angular's
 * dependency injection system. The descriptor intentionally leaves
 * `initialState` undefined so the service's `hydrate()` factory is visibly
 * responsible for supplying the initial value during `initialize()`.
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

        // Leaves the descriptor fallback empty so hydrate() supplies the value
        initialState: undefined
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
