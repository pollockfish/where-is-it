import {Component, input} from '@angular/core';

@Component({
  selector: 'app-item-card',
  styleUrl: './item-card.component.css',
  template: `
    <section>
        <tr>
          <th id="item-card-name">{{name()}}</th>
          <td id="item-card-location">{{location()}}</td>
        </tr>
    </section>
  `
})
export class ItemCardComponent {
    readonly name = input<string>();
    readonly location = input<string>();
}

// id="item-card-content"
//   "item-card-name"
//   "item-card-location"