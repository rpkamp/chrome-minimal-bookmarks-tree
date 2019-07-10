export interface Dialog {
  show(window: Window): void;
}

function createButton(window: Window, label: string, callback: Function, isPrimary: boolean = false): HTMLButtonElement {
  const element = window.document.createElement('button');
  element.className = 'btn ' + (isPrimary ? ' primary' : '');
  element.innerText = label;

  element.addEventListener('click', () => callback());

  return element;
}

export class ConfirmDialog implements Dialog {
  question: string;
  callback: Function;
  wrapper: HTMLDivElement | null = null;

  constructor(question: string, callback: Function) {
    this.question = question;
    this.callback = callback;
  }

  show(window: Window): void {
    const wrapper = window.document.createElement('div');
    wrapper.id = 'dialog';

    const question = window.document.createElement('p');
    question.innerHTML = this.question;

    wrapper.appendChild(question);

    wrapper.appendChild(
      createButton(
        window,
        chrome.i18n.getMessage('confirmationConfirm'),
        () => {
          this.callback();
          this.destroy();
        },
        true
      )
    );

    wrapper.appendChild(
      createButton(
        window,
        chrome.i18n.getMessage('confirmationDeny'),
        () => {
          this.destroy()
        }
      )
    );

    (window.document.querySelector('body') as HTMLBodyElement).appendChild(wrapper);
    this.wrapper = wrapper;
  }

  private destroy(): void {
    if (null === this.wrapper) {
      return;
    }

    if (!(this.wrapper.parentNode instanceof HTMLElement)) {
      return;
    }

    this.wrapper.parentNode.removeChild(this.wrapper);
  }
}

type InputField = {
  id: string;
  label: string;
  value: string;
}

export class EditDialog implements Dialog {
  inputFields: InputField[];
  callback: Function;
  wrapper: HTMLElement | null = null;
  inputs: HTMLInputElement[] = [];

  constructor(inputFields: InputField[], callback: Function) {
    this.inputFields = inputFields;
    this.callback = callback;
  }

  show(window: Window): void {
    const document = window.document;

    const wrapper = document.createElement('div');
    wrapper.id = 'dialog';

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

    wrapper.appendChild(
      createButton(
        window,
        chrome.i18n.getMessage('bookmarkEditSave'),
        () => {
          const data: { [s: string]: string } = {};
          this.inputs.forEach((input) => {
            data[input.id] = input.value;
          });

          this.callback(data);
          this.destroy();
        },
        true
      )
    );

    wrapper.appendChild(
      createButton(
        window,
        chrome.i18n.getMessage('bookmarkEditCancel'),
        () => { this.destroy()}
      )
    );

    (window.document.querySelector('body') as HTMLBodyElement).appendChild(wrapper);

    if (this.inputs[0] instanceof HTMLInputElement) {
      this.inputs[0].focus();
    }

    this.wrapper = wrapper;
  }

  private destroy(): void {
    if (null === this.wrapper) {
      return;
    }

    if (!(this.wrapper.parentNode instanceof HTMLElement)) {
      return;
    }

    this.wrapper.parentNode.removeChild(this.wrapper);
  }
}
