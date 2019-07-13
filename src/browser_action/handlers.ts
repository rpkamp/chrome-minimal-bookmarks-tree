import {
  getElementData,
  openAllBookmarks,
  toggleFolder
} from "./functions";
import {nothing} from "../common/functions";
import {BookmarkOpener, BookmarkOpeningDisposition} from "../common/BookmarkOpener";
import {SettingsFactory} from "../common/settings/SettingsFactory";
import {ChromeTranslator} from "../common/translator/ChromeTranslator";
import {DialogRenderer} from "./DialogRenderer";
import {ContextMenuFactory} from "./ContextMenuFactory";
import {ContextMenuRenderer} from "./ContextMenuRenderer";
import {WindowLocationCalculator} from "./location_calculator/WindowLocationCalculator";

const settings = SettingsFactory.create();
const translator = new ChromeTranslator();
const dialogRenderer = new DialogRenderer(document, translator);
const contextMenuFactory = new ContextMenuFactory(translator, dialogRenderer, settings);
const contextMenuRenderer = new ContextMenuRenderer(document, new WindowLocationCalculator(window));

function openBookmark(url: string, where: string): void {
  let disposition: BookmarkOpeningDisposition;
  let closeWindow: boolean = true;

  switch (where) {
    case 'new':
      disposition = BookmarkOpeningDisposition.foregroundTab;
      break;
    case 'background':
      disposition = BookmarkOpeningDisposition.backgroundTab;
      closeWindow = false;
      break;
    case 'new-window':
      disposition = BookmarkOpeningDisposition.newWindow;
      break;
    case 'new-incognito-window':
      disposition = BookmarkOpeningDisposition.newIncognitoWindow;
      break;
    default:
      disposition = BookmarkOpeningDisposition.activeTab;
  }

  BookmarkOpener.open(url, disposition);

  if (closeWindow) {
    window.close();
  }
}

export function clickHandler(event: MouseEvent) {
  // @TODO: This should use ContextMenuRenderer.clear()
  const elem = window.document.querySelector('.contextMenu');
  if (elem instanceof HTMLElement && elem.parentNode instanceof HTMLElement) {
    elem.parentNode.removeChild(elem);

    return;
  }

  if (!(event.target instanceof HTMLElement)) {
    return false;
  }

  if (event.target.nodeName !== 'SPAN') {
    return false;
  }

  document.querySelectorAll('.selected').forEach((element: Element) => {
    element.classList.remove('selected');
  });

  if (event.target.parentNode instanceof HTMLElement && event.target.parentNode.classList.contains('folder')) {
    toggleFolder(event.target.parentNode);

    return false;
  }

  if (event.button !== 0) {
    return false;
  }

  let actionType = 'click_action';

  if (event.ctrlKey || event.metaKey) {
    actionType = 'super_click_action';
  }

  if (event.target.parentNode instanceof HTMLElement) {
    const url = getElementData(event.target.parentNode, 'url');
    const settings = SettingsFactory.create();
    openBookmark(url, settings.getString(actionType));
  }

  return nothing(event);
}

export function contextMenuHandler(event: MouseEvent) {
  if (!(event.target instanceof HTMLElement)) {
    return nothing(event);
  }

  if (event.target.nodeName !== 'SPAN') {
    return nothing(event);
  }

  document.querySelectorAll('.selected').forEach((element: Element) => {
    element.classList.remove('selected');
  });

  if (!(event.target.parentNode instanceof HTMLElement)) {
    return nothing(event);
  }

  if (event.target.parentNode.classList.contains('folder')) {
    const folder = event.target.parentNode;
    folder.classList.add('selected');

    contextMenuRenderer.render(
      contextMenuFactory.forFolder(folder),
      {
        x: event.pageX,
        y: event.pageY,
      }
    );

    return nothing(event);
  }

  const bookmark = event.target.parentNode;
  bookmark.classList.add('selected');

  contextMenuRenderer.render(
    contextMenuFactory.forBookmark(bookmark),
    {
      x: event.pageX,
      y: event.pageY,
    }
  );

  return nothing(event);
}

export function mouseDownHandler(event: MouseEvent) {
  if (!(event.target instanceof HTMLElement)) {
    return false;
  }

  if (event.target.nodeName !== 'SPAN') {
    return false;
  }

  document.querySelectorAll('.selected').forEach((element: Element) => {
    element.classList.remove('selected');
  });

  if (event.button !== 1 || !(event.target.parentNode instanceof HTMLElement)) {
    return false;
  }

  if (event.target.parentNode.classList.contains('folder')) {
    openAllBookmarks(getElementData(event.target.parentNode, 'item-id'));
    return nothing(event);
  }

  const url = getElementData(event.target.parentNode, 'url');
  const settings = SettingsFactory.create();
  openBookmark(url, settings.getString('middle_click_action'));
}
