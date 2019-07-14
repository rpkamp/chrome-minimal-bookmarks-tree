import {translateDocument} from '../common/functions';
import {setElementDimensions} from './functions';
import {SettingsFactory} from '../common/settings/SettingsFactory';
import {initDragDrop} from "./drag_drop";
import {ClickHandler} from "./ClickHandler";
import {ContextMenuFactory} from "./ContextMenuFactory";
import {ChromeTranslator} from "../common/translator/ChromeTranslator";
import {DialogRenderer} from "./DialogRenderer";
import {ContextMenuRenderer} from "./ContextMenuRenderer";
import {WindowLocationCalculator} from "./location_calculator/WindowLocationCalculator";
import {TreeRenderer} from "./TreeRenderer";
import PersistentSet from "./PersistentSet";
import {FolderToggler} from "./FolderToggler";

const settings = SettingsFactory.create();

const translator = new ChromeTranslator();
const dialogRenderer = new DialogRenderer(document, translator);
const contextMenuFactory = new ContextMenuFactory(translator, dialogRenderer, settings);
const contextMenuRenderer = new ContextMenuRenderer(document, new WindowLocationCalculator(window));

const openFolders: PersistentSet<string> = new PersistentSet('openfolders');
const treeRenderer = new TreeRenderer(
  openFolders,
  settings.isEnabled('hide_empty_folders'),
  settings.isEnabled('start_with_all_folders_closed')
);

const folderToggler = new FolderToggler(openFolders, treeRenderer, settings);

const clickHandler = new ClickHandler(
  settings,
  contextMenuFactory,
  contextMenuRenderer,
  folderToggler
);

const loading = <HTMLElement>document.querySelector('#loading');
const bm = <HTMLElement>document.querySelector('#bookmarks');
const wrapper = <HTMLElement>document.querySelector('#bookmarks');

chrome.bookmarks.getTree((bookmarksTree) => {
  if (typeof bookmarksTree[0] === 'undefined') {
    return;
  }

  if (typeof bookmarksTree[0].children === 'undefined') {
    return;
  }

  const otherBookmarks = treeRenderer.renderTree(
    bookmarksTree[0].children[1],
    document,
    true
  );

  delete bookmarksTree[0].children[1];
  const bookmarksFolder = treeRenderer.renderTree(
    bookmarksTree[0],
    document,
    true
  );

  if (bookmarksFolder) {
    bm.appendChild(bookmarksFolder);
    bm.childNodes.forEach((item: ChildNode) => {
      if (item.nodeName !== 'LI') {
        return;
      }
      (item as Element).classList.add('nosort');
    });
  }
  if (otherBookmarks) {
    bm.appendChild(otherBookmarks);
  }

  if (settings.isEnabled('remember_scroll_position')) {
    const scrolltop = localStorage.getItem('scrolltop');
    if (null !== scrolltop) {
      setTimeout(() => { wrapper.scrollTop = parseInt(scrolltop, 10); }, 100);
    }
  }

  (bm as HTMLElement).style.display = 'block';
  (loading.parentNode as HTMLElement).removeChild(loading);
});

bm.addEventListener('click', (event) => { clickHandler.handleClick(event); });
bm.addEventListener('contextmenu', (event) => { clickHandler.handleRightClick(event); });
bm.addEventListener('mousedown', (event) => { clickHandler.handleMouseDown(event); });
document.addEventListener('contextmenu', () => false);

initDragDrop(bm, wrapper);

if (settings.isEnabled('remember_scroll_position')) {
  let scrollTimeout: number | undefined;
  wrapper.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = <number><any>setTimeout(() => { localStorage.setItem('scrolltop', String(wrapper.scrollTop)); }, 100);
  });
}

translateDocument(window.document);

setElementDimensions(wrapper, settings.getNumber('width'), settings.getNumber('height'));

const font: string = settings.getString('font');
if (font !== '__default__') {
  document.body.style.fontFamily = `"${font}"`;
}

document.body.classList.add(`theme--${settings.getString('theme')}`);
