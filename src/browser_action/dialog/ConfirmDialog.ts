import {DialogBuilder} from "./DialogBuilder";
import {Dialog} from "../Dialog";
import {Translator} from "../../common/Translator";

export class ConfirmDialog implements Dialog {
  question: string;
  callback: Function;

  constructor(question: string, callback: Function) {
    this.question = question;
    this.callback = callback;
  }

  render(
    wrapper: HTMLElement,
    document: Document,
    translator: Translator,
    done: Function
  ): void {
    const question = document.createElement('p');
    question.innerHTML = this.question;

    wrapper.appendChild(question);

    const builder = new DialogBuilder();

    wrapper.appendChild(
      builder.createButton(
        document,
        translator.translate('confirmationConfirm'),
        () => { this.callback(); done(); },
        true
      )
    );

    wrapper.appendChild(
      builder.createButton(
        document,
        translator.translate('confirmationDeny'),
        done
      )
    );
  }

  onBeforeRender(document: Document): void {
  }

  onAfterRender(document: Document): void {
  }
}
