import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<app-game></app-game>',
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
    }
  `]
})
export class AppComponent {
  title = 'Flappy Bird';
} 