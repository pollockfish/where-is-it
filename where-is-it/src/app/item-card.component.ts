import {Component, input} from '@angular/core';

@Component({
  selector: 'app-item-card',
  styleUrl: './item-card.component.css',
  template: `
    <section id="item-card">
        <div id="item-card-content">
            <span id="item-card-name">{{name()}}</span>
            <p id="item-card-location">{{location()}}</p>
        </div>
    </section>
  `
})
export class ItemCardComponent {
    readonly name = input<string>();
    readonly location = input<string>();
}