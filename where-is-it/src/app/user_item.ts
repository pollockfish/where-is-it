import {Component, input} from '@angular/core';

@Component({
    selector: 'app-user-item',
    template: ` <p>{{name()}}: {{location()}}</p>`
})

export class UserItem {
    readonly name = input<string>();
    readonly location = input<string>();
}