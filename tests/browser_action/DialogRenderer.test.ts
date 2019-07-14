import {DialogRenderer} from "../../src/browser_action/DialogRenderer";
import {IdentityTranslator} from "../test_doubles/IdentityTranslator";
import {ConfirmDialog} from "../../src/browser_action/dialog/ConfirmDialog";

beforeEach(() => {
  document.body.innerHTML = '';
});

test('Render dialogs to body', () => {
  const renderer = new DialogRenderer(document, new IdentityTranslator());

  renderer.render(new ConfirmDialog('Are you sure?', () => {}));

  expect(document.body.querySelector('#dialog')).not.toBeNull();
});

test('Removes dialog from body when done', () => {
  const renderer = new DialogRenderer(document, new IdentityTranslator());

  renderer.render(new ConfirmDialog('Are you sure?', () => {}));

  (document.querySelector('.primary') as HTMLButtonElement).click();

  expect(document.querySelector('#dialog')).toBeNull();
});
