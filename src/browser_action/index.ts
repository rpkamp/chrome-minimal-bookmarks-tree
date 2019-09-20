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
import {Utils} from "../common/Utils";
import {KeyHandler} from "./KeyHandler";
import {BookmarkManager} from "./BookmarkManager";

const settings = SettingsFactory.create();

const translator = new ChromeTranslator();
const dialogRenderer = new DialogRenderer(document, translator);
const bookmarkManager = new BookmarkManager(translator, dialogRenderer, settings);
const contextMenuFactory = new ContextMenuFactory(bookmarkManager, translator, dialogRenderer, settings);
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

const keyHandler = new KeyHandler(bookmarkManager);

const loading = <HTMLElement>document.querySelector('#loading');
const bm = <HTMLElement>document.querySelector('#bookmarks');
const wrapper = <HTMLElement>document.querySelector('#wrapper');

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
      setTimeout(() => { wrapper.scrollTop = parseInt(scrolltop, 10); }, 10);
    }
  }

  (bm as HTMLElement).style.display = 'block';
  (loading.parentNode as HTMLElement).removeChild(loading);
});

bm.addEventListener('click', (event) => { clickHandler.handleClick(event); });
bm.addEventListener('contextmenu', (event) => { clickHandler.handleRightClick(event); });
bm.addEventListener('mousedown', (event) => { clickHandler.handleMouseDown(event); });

if (settings.isEnabled('keyboard_support')) {
  window.addEventListener('keyup', (event) => { keyHandler.handleKeyUp(event); });
}

document.addEventListener('contextmenu', () => false);

initDragDrop(bm, wrapper);

if (settings.isEnabled('remember_scroll_position')) {
  let scrollTimeout: number | undefined;
  wrapper.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = <number><any>setTimeout(() => { localStorage.setItem('scrolltop', String(wrapper.scrollTop)); }, 100);
  });
}

Utils.translateDocument(window.document);

// Not enforced by this extension, but hardcoded in chrome.
// So we need to prevent creating a browser action bigger than that, because:
//
//   1. When height > 800 it will cause duplicate vertical scrollbars
//   2. When width > 600 it will cause
//      a) the vertical scrollbar to be out of view
//      b) a horizontal scrollbar to be shown
//
// Also see https://stackoverflow.com/questions/6904755/is-there-a-hardcoded-maximum-height-for-chrome-browseraction-popups
const browserActionMaxHeight: number = 600;
const browserActionMaxWidth: number = 800;

const width: number = Math.floor(Math.min(browserActionMaxWidth, settings.getNumber('width')));
const height: number = Math.floor(Math.min(browserActionMaxHeight, settings.getNumber('height')));

wrapper.style.width = `${width}px`;
wrapper.style.minWidth = `${width}px`;
wrapper.style.maxWidth = `${width}px`;
wrapper.style.maxHeight = `${height}px`;

const font: string = settings.getString('font');
if (font !== '__default__') {
  document.body.style.fontFamily = `"${font}"`;
}

document.body.classList.add(`theme--${settings.getString('theme')}`);
