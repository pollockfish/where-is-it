import { Component, EventEmitter, input, signal, Output } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { ApiService } from "../../api.service";

@Component({
    standalone: true,
    selector: 'app-login',
    styleUrls: ['./login.component.css', './app.css'],
    imports: [FormsModule],
    template: `
    <section id="login-form">
        <form (submit)="onLogin()">
            <h2 id="login-title">Welcome Back! Missing Something?</h2>
            <label for="email">Please enter your email</label>
            <br/>
            <input type="email" id="email" [(ngModel)]="userEmail" name="email" required />
            <br/>
            <button type="button" (click)="onLogin()">Login</button>
        </form>
    </section>
    `
})

export class LoginComponent {
    @Output() valueChange = new EventEmitter<string>(); 

    readonly userEmail = '';

    constructor() {
    }


    onLogin(): void {
        console.log(`Logging in with username: ${this.userEmail}`);
        if(this.userEmail.trim() === '') {
            console.warn('Email address is required.');
            return;
        } else {
            this.valueChange.emit(this.userEmail);
        }
        
    }
}