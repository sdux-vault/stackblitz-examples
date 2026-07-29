import { ApplicationConfig } from '@angular/core';
import { provideFeatureCell, provideVault } from '@sdux-vault/angular';
import { EmployeeCell } from './employee.service';

/**
 * Registers the Vault runtime and the employees FeatureCell for the standalone
 * Angular application. The descriptor supplies the state key and its initial
 * empty-array value before the component starts interacting with the cell.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideVault({ logLevel: 'off' }),
    provideFeatureCell(EmployeeCell, {
      key: 'employees',
      initialState: []
    })
  ]
};
