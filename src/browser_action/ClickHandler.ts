import {getElementData, openAllBookmarks, toggleFolder} from "./functions";
import {nothing} from "../common/functions";
import {BookmarkOpener, BookmarkOpeningDisposition} from "../common/BookmarkOpener";
import {ContextMenuFactory} from "./ContextMenuFactory";
import {ContextMenuRenderer} from "./ContextMenuRenderer";
import {Settings} from "../common/Settings";

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

export class ClickHandler {
  private settings: Settings;
  private contextMenuFactory: ContextMenuFactory;
  private contextMenuRenderer: ContextMenuRenderer;

  constructor(settings: Settings, contextMenuFactory: ContextMenuFactory, contextMenuRenderer: ContextMenuRenderer) {
    this.settings = settings;
    this.contextMenuFactory = contextMenuFactory;
    this.contextMenuRenderer = contextMenuRenderer;
  }

  handleClick(event: MouseEvent) {
    if (this.contextMenuRenderer.isMenuOpen()) {
      this.contextMenuRenderer.clear();

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
      openBookmark(url, this.settings.getString(actionType));
    }

    return nothing(event);
  }

  handleRightClick(event: MouseEvent) {
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

    const offset = {
      x: event.pageX,
      y: event.pageY,
    };

    if (event.target.parentNode.classList.contains('folder')) {
      const folder = event.target.parentNode;
      folder.classList.add('selected');

      this.contextMenuRenderer.render(
        this.contextMenuFactory.forFolder(folder),
        offset
      );

      return nothing(event);
    }

    const bookmark = event.target.parentNode;
    bookmark.classList.add('selected');

    this.contextMenuRenderer.render(
      this.contextMenuFactory.forBookmark(bookmark),
      offset
    );

    return nothing(event);
  }

  handleMouseDown(event: MouseEvent) {
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
    openBookmark(url, this.settings.getString('middle_click_action'));
  }
}
