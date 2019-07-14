import {BookmarkOpener, BookmarkOpeningDisposition} from "../common/BookmarkOpener";
import {ContextMenuFactory} from "./ContextMenuFactory";
import {ContextMenuRenderer} from "./ContextMenuRenderer";
import {Settings} from "../common/Settings";
import {FolderToggler} from "./FolderToggler";
import {Utils} from "../common/Utils";

export class ClickHandler {
  private settings: Settings;
  private contextMenuFactory: ContextMenuFactory;
  private contextMenuRenderer: ContextMenuRenderer;
  private folderToggler: FolderToggler;

  constructor(
    settings: Settings,
    contextMenuFactory: ContextMenuFactory,
    contextMenuRenderer: ContextMenuRenderer,
    folderToggler: FolderToggler
  ) {
    this.settings = settings;
    this.contextMenuFactory = contextMenuFactory;
    this.contextMenuRenderer = contextMenuRenderer;
    this.folderToggler = folderToggler;
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
      this.folderToggler.toggle(event.target.parentNode);

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
      const url = Utils.getElementData(event.target.parentNode, 'url');
      ClickHandler.openBookmark(url, this.settings.getString(actionType));
    }

    return Utils.nothing(event);
  }

  handleRightClick(event: MouseEvent) {
    if (!(event.target instanceof HTMLElement)) {
      return Utils.nothing(event);
    }

    if (event.target.nodeName !== 'SPAN') {
      return Utils.nothing(event);
    }

    document.querySelectorAll('.selected').forEach((element: Element) => {
      element.classList.remove('selected');
    });

    if (!(event.target.parentNode instanceof HTMLElement)) {
      return Utils.nothing(event);
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

      return Utils.nothing(event);
    }

    const bookmark = event.target.parentNode;
    bookmark.classList.add('selected');

    this.contextMenuRenderer.render(
      this.contextMenuFactory.forBookmark(bookmark),
      offset
    );

    return Utils.nothing(event);
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
      Utils.openAllBookmarks(Utils.getElementData(event.target.parentNode, 'itemId'));
      return Utils.nothing(event);
    }

    const url = Utils.getElementData(event.target.parentNode, 'url');
    ClickHandler.openBookmark(url, this.settings.getString('middle_click_action'));
  }

  static openBookmark(url: string, where: string): void {
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
}
