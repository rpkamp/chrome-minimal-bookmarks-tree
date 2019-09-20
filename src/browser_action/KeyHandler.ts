import {BookmarkManager} from "./BookmarkManager";

export class KeyHandler {
  private bookmarkManager: BookmarkManager;

  constructor(bookmarkManager: BookmarkManager) {
    this.bookmarkManager = bookmarkManager;
  }

  handleKeyUp(event: KeyboardEvent) {
    if (event.key !== 'Delete') {
      return;
    }

    const hoverNodes = document.querySelectorAll(':hover[data-item-id]:not(.folder)');
    if (hoverNodes.length !== 1) {
      // we want to return when we either found no nodes, or more than 1
      // when no node is found there is nothing to be done, when multiple are found
      // it is ambiguous what should be done, so we best do nothing.
      return;
    }

    const bookmark = hoverNodes[0];
    if (!(bookmark instanceof HTMLElement)) {
      return;
    }

    this.bookmarkManager.deleteBookmark(bookmark);
  }
}
