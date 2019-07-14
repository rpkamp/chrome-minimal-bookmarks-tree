import {ContextMenuItem} from "./ContextMenuItem";

export class ContextMenu {
  private items: ContextMenuItem[];

  constructor(items: ContextMenuItem[]) {
    this.items = items;
  }

  render(wrapper: HTMLElement, done: Function) {
    this.items.forEach((item: ContextMenuItem) => {
      wrapper.appendChild(
        item.render(document, done)
      );
    });
  }
}
