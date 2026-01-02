import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {User} from './user';

@Component({
  selector: 'app-root',
  imports: [User],
  template: `
    <section>
      <app-user name="Frank"/>
    </section>
    @if(isServerRunning) {
      <span>
        Yes, the server is running
      </span>
    }
    @else {
      <span>
        No, the server is down
      </span>
    }
    @for (os of operatingSystems; track os.id) {
      <p>{{os.name}}</p>
    }
    @for (user of users; track user.id) {
      <p>{{user.name}}</p>
    }
    <div [contentEditable]="isEditable"></div>
    <section (mouseover)="showSecretMessage()">
      Hover over me!
      {{message}}
    </section>
`,
  styleUrl: './app.css'
})
export class App {
  isServerRunning = true;
  operatingSystems = [{id: 'windows', name: 'Windows'}, {id: 'linux', name: 'Linux'}];
  users = [
    {id: 0, name: 'Connor'},
    {id: 1, name: 'Connor\'s cat Rogue'}
  ]
  isEditable = true;
  message = '';

  showSecretMessage() {
    this.message = 'Hey! You did it!';
  }
}
