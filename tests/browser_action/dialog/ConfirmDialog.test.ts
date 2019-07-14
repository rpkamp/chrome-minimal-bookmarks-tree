import {ConfirmDialog} from "../../../src/browser_action/dialog/ConfirmDialog";
import {IdentityTranslator} from "../../test_doubles/IdentityTranslator";

test('Callback is called when confirm is pressed', () => {
  let callbackCalled = false;
  const dialog = new ConfirmDialog('Are you sure?', () => { callbackCalled = true; });

  const wrapper = document.createElement('div');

  let dialogDoneCalled = false;
  dialog.render(
    wrapper,
    document,
    new IdentityTranslator(),
    () => { dialogDoneCalled = true }
  );

  (wrapper.querySelector('.primary') as HTMLButtonElement).click();

  expect(callbackCalled).toBeTruthy();
  expect(dialogDoneCalled).toBeTruthy();
});

test('Callback is not called when cancel is pressed', () => {
  let callbackCalled = false;
  const dialog = new ConfirmDialog('Are you sure?', () => { callbackCalled = true; });

  const wrapper = document.createElement('div');

  let dialogDoneCalled = false;
  dialog.render(
    wrapper,
    document,
    new IdentityTranslator(),
    () => { dialogDoneCalled = true }
  );

  (wrapper.querySelector('button:not(.primary)') as HTMLButtonElement).click();

  expect(callbackCalled).toBeFalsy();
  expect(dialogDoneCalled).toBeTruthy();
});
