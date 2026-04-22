import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { ExampleComponent } from './app/example.component';

// eslint-disable-next-line
bootstrapApplication(ExampleComponent, appConfig).catch((err: any) =>
  console.error(err)
);
