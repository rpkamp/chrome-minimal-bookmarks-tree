import {Translator} from "../common/Translator";

export interface Dialog {
  render(
    wrapper: HTMLElement,
    document: Document,
    translator: Translator,
    done: Function
  ): void;

  onBeforeRender(document: Document): void;

  onAfterRender(document: Document): void;
}
