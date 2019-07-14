import {ContextMenuTextItem} from "../../src/browser_action/context_menu/ContextMenuTextItem";
import {ContextMenu} from "../../src/browser_action/ContextMenu";
import {ContextMenuRenderer} from "../../src/browser_action/ContextMenuRenderer";
import {IdentityLocationCalculator} from "../test_doubles/IdentityLocationCalculator";

beforeEach(() => {
  document.body.innerHTML = '';
});

test('Render context menu to body', () => {
  const menu = new ContextMenu([
    new ContextMenuTextItem('foo', () => {})
  ]);

  const renderer = new ContextMenuRenderer(document, new IdentityLocationCalculator());

  renderer.render(menu, {x: 0, y: 0});

  expect(document.body.querySelector('.contextMenu')).not.toBeNull();
});

test('Remove context menu when a new one opens', () => {
  const menu1 = new ContextMenu([
    new ContextMenuTextItem('foo', () => {})
  ]);
  const menu2 = new ContextMenu([
    new ContextMenuTextItem('bar', () => {})
  ]);

  const renderer = new ContextMenuRenderer(document, new IdentityLocationCalculator());

  renderer.render(menu1, {x: 0, y: 0});
  renderer.render(menu2, {x: 0, y: 0});

  expect(document.body.querySelectorAll('.contextMenu')).toHaveLength(1);
});

test('Remove context menu when item was clicked', () => {
  const menu = new ContextMenu([
    new ContextMenuTextItem('foo', () => {})
  ]);

  const renderer = new ContextMenuRenderer(document, new IdentityLocationCalculator());

  renderer.render(menu, {x: 0, y: 0});
  (document.querySelector('.contextMenu li') as HTMLLIElement).click();

  expect(document.body.querySelectorAll('.contextMenu')).toHaveLength(0);
});
