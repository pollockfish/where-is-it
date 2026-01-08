import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient, httpResource } from '@angular/common/http';

import {ApiService} from '../../api.service';
import { UserItem } from './user_item';
import { ItemCardComponent } from './item-card.component';
import { LoginComponent } from './login.component';

// TO-DO
// - Implement login system
// - Implement loading indicator
// - Add error handling for fetch requests
// - Style the app with CSS
// - Add functionality to delete items
// - Add functionality to update item locations

@Component({
  selector: 'app-root',
  imports: [ItemCardComponent, LoginComponent],
  template: `
    <section>
      <h1 id="logo">Where Is It?</h1>
      <p id="tagline">For all those things you know you're gonna lose.</p>
    </section>
    <section>
      <p id="instructions">Send an email to <a href="mailto:whereisitserver@gmail.com">whereisitserver@gmail.com</a> 
      with the subject as the name of the item (e.g., "Keys") and the body as the last known location of the item
      (e.g., "On the kitchen table") to add it to the database.</p>
    </section>
    @if (!loggedIn()) {
    <section>
      <app-login (valueChange)="receiveEmailAddress($event)"></app-login>
    </section>
    } @else {
      <section>
        <h2 id="tracked-items">Tracked Items:</h2>
        @if (isLoading()) {
          <p>Loading items...</p>
        } @else {
            <div>
              <table id="item-card-grid">
                @for (item of emailArray(); track item.name) {
                  <app-item-card name="{{item.name}}" location="{{item.location}}"/>
                }
              </table>
            </div>
        }
      </section>
   }
`,
  styleUrl: './app.css'
})

export class App implements OnInit {

  userEmail = '';

  emailArray = signal<UserItem[]>([]);
  isLoading = signal(true);
  loggedIn = signal(false);
  
  constructor() {}

  ngOnInit(): void {
    this.getEmails();
  }

  receiveEmailAddress(emailEvent: any): void {
    this.userEmail = emailEvent;
    console.log(`Received email address: ${this.userEmail}`);
    this.getEmailsBySender(this.userEmail);
  };

  async getEmails(): Promise<void> {
    try {
      const response = await ApiService.getEmails();
      console.log('Data from port 3000:', response);
      this.addEmailsToArray(response);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getEmailsBySender(sender: string): Promise<void> {
    try {
      await ApiService.getEmailsBySender(this.userEmail).then((emails) => {
            console.log('Fetched emails:', emails);
            // Here you would typically update some shared state or service
            // to indicate that the user is logged in and store the fetched emails.
            this.addEmailsToArray(emails);
            this.loggedIn.set(true);
        }).catch((error) => {
            console.error('Error during login:', error);
        });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  addEmailsToArray(emails: any): void {
    const emailItems: UserItem[] = emails.map((email: any) => ({ name: email.subject, location: email.text }));
    this.emailArray.set(emailItems);
  }
}