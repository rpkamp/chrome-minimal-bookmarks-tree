import {LocationCalculator} from "./LocationCalculator";
import {Offset} from "./Offset";
import {ContextMenu} from "./ContextMenu";

export class ContextMenuRenderer {
  private document: Document;
  private locationCalculator: LocationCalculator;
  private wrapper: HTMLElement | null = null;

  constructor(document: Document, locationCalculator: LocationCalculator) {
    this.document = document;
    this.locationCalculator = locationCalculator;
  }

  render(menu: ContextMenu, offset: Offset) {
    this.clear();
    const wrapper = window.document.createElement('ul');
    wrapper.className = 'contextMenu';

    menu.render(wrapper, () => { this.clear(); });

    wrapper.style.left = '-10000px';

    this.wrapper = wrapper;
    this.document.body.appendChild(this.wrapper);

    const coordinates: Offset = this.locationCalculator.calculate(
      wrapper.getBoundingClientRect(),
      offset
    );

    wrapper.style.left = `${coordinates.x}px`;
    wrapper.style.top = `${coordinates.y}px`;
  }

  isMenuOpen(): boolean {
    return null !== this.wrapper;
  }

  clear() {
    if (null === this.wrapper) {
      return;
    }

    this.document.body.removeChild(this.wrapper);
    this.wrapper = null;
  }
}
