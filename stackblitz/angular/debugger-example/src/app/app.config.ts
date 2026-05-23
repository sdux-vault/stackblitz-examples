import { ApplicationConfig } from '@angular/core';
import { provideFeatureCell, provideVault } from '@sdux-vault/angular';
import { InsightConfig } from '@sdux-vault/shared';
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
      logLevel: 'off',
      devMode: true
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
        initialState: [],

        // Insights enable the debugger to capture runtime telemetry for this
        // FeatureCell. Each flag controls what data the debugger records:
        //
        //   wantsErrors  — Capture error signals emitted during pipeline execution.
        //   wantsPayload — Capture operation payloads for each pipeline event.
        //   wantsState   — Capture full state snapshots (can produce large exports).
        //
        // At minimum, enable wantsErrors and wantsPayload for useful debug sessions.
        insights: {
          wantsErrors: true,
          wantsPayload: true,
          wantsState: false
        } as InsightConfig
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
