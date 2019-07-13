export class DialogBuilder {
  createButton(document: Document, label: string, callback: Function, isPrimary: boolean = false): HTMLButtonElement {
    const element = document.createElement('button');
    element.className = 'btn ' + (isPrimary ? ' primary' : '');
    element.innerText = label;

    element.addEventListener('click', () => callback());

    return element;
  }
}
