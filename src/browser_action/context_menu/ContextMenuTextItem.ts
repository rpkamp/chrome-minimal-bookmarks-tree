import {ContextMenuItem} from "../ContextMenuItem";

export class ContextMenuTextItem implements ContextMenuItem {
  private readonly label: string;
  private readonly callback: Function;

  constructor(label: string, callback: Function) {
    this.label = label;
    this.callback = callback;
  }

  render(document: Document, done: Function): HTMLElement {
    const element = window.document.createElement('li');
    element.innerText = this.label;
    element.addEventListener('click', () => { this.callback(); done(); });

    return element;
  }
}
