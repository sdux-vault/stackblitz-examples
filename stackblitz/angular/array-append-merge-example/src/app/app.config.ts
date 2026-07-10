import { ApplicationConfig } from '@angular/core';
import { withArrayAppendMergeBehavior } from '@sdux-vault/addons';
import { provideFeatureCell, provideVault } from '@sdux-vault/angular';
import { ExampleService } from './example.service';

/**
 * Application-level configuration for the Angular standalone bootstrap.
 *
 * Registers the Vault runtime and the ExampleService FeatureCell as dependency
 * injection providers. The FeatureCell descriptor includes an `initialState`
 * value that seeds the pipeline on the first `initialize()` call, demonstrating
 * how a FeatureCell starts with pre-populated state without an explicit
 * `replaceState()` invocation. The `withArrayAppendMergeBehavior` is registered
 * as a definition-time behavior, configuring the FeatureCell to concatenate
 * incoming arrays with the existing state on every `mergeState()` call.
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
        initialState: [{ id: 66, name: 'Darth', lastName: 'Vader' }]
      },

      // Optional definition-time extensions
      [
        // Register the withArrayAppendMergeBehavior to enable array append merge semantics
        withArrayAppendMergeBehavior
        // --> Register add-on behaviors here <--
      ],
      [
        // --> Register add-on controllers here <--
      ]
    )
  ]
};
