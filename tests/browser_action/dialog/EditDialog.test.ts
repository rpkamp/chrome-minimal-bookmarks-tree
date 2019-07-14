import {IdentityTranslator} from "../../test_doubles/IdentityTranslator";
import {EditDialog} from "../../../src/browser_action/dialog/EditDialog";

test('Return entered values', () => {
  let receivedData = {};
  const dialog = new EditDialog([
      {id: 'foo', 'label': 'Foo', 'value': ''},
      {id: 'bar', 'label': 'Bar', 'value': ''}
    ],
    (data: object) => { receivedData = data; }
  );

  const wrapper = document.createElement('div');

  let dialogDoneCalled = false;

  dialog.render(
    wrapper,
    document,
    new IdentityTranslator(),
    () => { dialogDoneCalled = true }
  );

  (wrapper.querySelector('#foo') as HTMLInputElement).value = 'bar';
  (wrapper.querySelector('#bar') as HTMLInputElement).value = 'baz';
  (wrapper.querySelector('.primary') as HTMLButtonElement).click();

  expect(receivedData).toEqual({'foo': 'bar', 'bar': 'baz'});
  expect(dialogDoneCalled).toBeTruthy();
});

test('Populate values', () => {
  let receivedData = {};
  const dialog = new EditDialog([
      {id: 'foo', 'label': 'Foo', 'value': '@@default@@'}
    ],
    (data: object) => { receivedData = data; }
  );

  const wrapper = document.createElement('div');

  let dialogDoneCalled = false;

  dialog.render(
    wrapper,
    document,
    new IdentityTranslator(),
    () => { dialogDoneCalled = true }
  );

  (wrapper.querySelector('.primary') as HTMLButtonElement).click();

  expect(receivedData).toEqual({'foo': '@@default@@'});
  expect(dialogDoneCalled).toBeTruthy();
});
