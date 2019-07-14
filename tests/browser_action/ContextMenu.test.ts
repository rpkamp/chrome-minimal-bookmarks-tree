import {ContextMenuTextItem} from "../../src/browser_action/context_menu/ContextMenuTextItem";
import {ContextMenu} from "../../src/browser_action/ContextMenu";

test('Render all menu items', () => {
  const item = new ContextMenuTextItem('foo', () => {});

  const menu = new ContextMenu([item]);

  const wrapper = document.createElement('div');

  menu.render(wrapper, () => {});

  expect(wrapper.childNodes).toHaveLength(1);
});

test('Call callbacks when clicked', () => {
  let itemCallbackFired = false;
  const item = new ContextMenuTextItem('foo', () => { itemCallbackFired = true; });

  const menu = new ContextMenu([item]);

  const wrapper = document.createElement('div');

  let menuCallbackFired = false;
  menu.render(wrapper, () => { menuCallbackFired = true; });

  (wrapper.querySelector('li') as HTMLElement).click();

  expect(itemCallbackFired).toBeTruthy();
  expect(menuCallbackFired).toBeTruthy();
});
