import {DialogBuilder} from "./DialogBuilder";
import {Dialog} from "../Dialog";
import {Translator} from "../../common/Translator";

type InputField = {
  id: string;
  label: string;
  value: string;
}

export class EditDialog implements Dialog {
  inputFields: InputField[];
  callback: Function;
  inputs: HTMLInputElement[] = [];

  constructor(inputFields: InputField[], callback: Function) {
    this.inputFields = inputFields;
    this.callback = callback;
  }

  render(
    wrapper: HTMLElement,
    document: Document,
    translator: Translator,
    done: Function
  ): void {
    this.inputFields.forEach((inputField) => {
      const row = document.createElement('div');
      row.className = 'row';

      const label = document.createElement('label');
      label.htmlFor = inputField.id;
      label.innerText = inputField.label;
      row.appendChild(label);

      const input = document.createElement('input');
      input.type = 'text';
      input.id = inputField.id;
      input.value = inputField.value;
      row.appendChild(input);

      wrapper.appendChild(row);

      this.inputs = this.inputs.concat(input);
    });

    const builder = new DialogBuilder();

    wrapper.appendChild(
      builder.createButton(
        document,
        translator.translate('bookmarkEditSave'),
        () => {
          const data: { [s: string]: string } = {};
          this.inputs.forEach((input) => {
            data[input.id] = input.value;
          });

          this.callback(data);
          done();
        },
        true
      )
    );

    wrapper.appendChild(
      builder.createButton(
        document,
        translator.translate('bookmarkEditCancel'),
        done
      )
    );
  }

  onBeforeRender(document: Document): void {
  }

  onAfterRender(document: Document): void {
    if (this.inputs[0] instanceof HTMLInputElement) {
      this.inputs[0].focus();
    }
  }
}
