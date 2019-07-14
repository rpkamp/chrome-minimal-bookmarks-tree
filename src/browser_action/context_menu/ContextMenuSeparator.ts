import {ContextMenuItem} from "../ContextMenuItem";

export class ContextMenuSeparator implements ContextMenuItem {
  render(document: Document, done: Function): HTMLElement {
    return window.document.createElement('hr');
  }
}
