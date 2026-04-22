import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ExampleService } from './example.service';

@Component({
  selector: 'example-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'example.component.html',
  styleUrls: ['../styles.scss', 'example.component.scss']
})
export class ExampleComponent {
  readonly #exampleService = inject(ExampleService);
}
