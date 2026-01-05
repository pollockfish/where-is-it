import { Component, input, signal } from "@angular/core";
import { FormsModule } from '@angular/forms';

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
            <label for="password">And your password <small>(if you remember where you wrote it down)</small></label>
            <br/>
            <input type="password" id="password" [(ngModel)]="password" name="password" required />
            <br/>
            <button type="button" (click)="buttonPressed.set(!buttonPressed())">Login</button>
        </form>
    </section>
    `
})

export class LoginComponent {
    readonly userEmail = '';
    readonly password = '';

    buttonPressed = signal(false);

    constructor() {
    }

    onLogin(): void {
        console.log(`Logging in with username: ${this.userEmail} and password: ${this.password}`);
    }
}