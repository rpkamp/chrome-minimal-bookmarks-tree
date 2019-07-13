import {Dialog} from "./Dialog";
import {Translator} from "../common/Translator";

export class DialogRenderer {
  private readonly document: Document;
  private wrapper: HTMLElement | null = null;
  private readonly translator: Translator;

  constructor(document: Document, translator: Translator) {
    this.document = document;
    this.translator = translator;
  }

  render(dialog: Dialog) {
    this.clear();

    dialog.onBeforeRender(this.document);

    const wrapper = this.document.createElement('div');
    wrapper.id = 'dialog';

    dialog.render(
      wrapper,
      this.document,
      this.translator,
      () => { this.clear(); }
    );

    this.wrapper = wrapper;
    this.document.body.appendChild(wrapper);

    dialog.onAfterRender(this.document);
  }

  private clear(): void {
    if (null === this.wrapper) {
      return;
    }

    document.body.removeChild(this.wrapper);
    this.wrapper = null;
  }
}
