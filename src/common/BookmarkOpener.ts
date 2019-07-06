import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

export enum BookmarkOpeningDisposition {
  activeTab,
  foregroundTab,
  backgroundTab,
  newWindow,
  newIncognitoWindow
}

export class BookmarkOpener {
  static open(url: string, disposition: BookmarkOpeningDisposition): void {
    switch (disposition) {
      case BookmarkOpeningDisposition.foregroundTab:
        chrome.tabs.create({ url, active: true });
        break;
      case BookmarkOpeningDisposition.backgroundTab:
        chrome.tabs.create({ url, active: false });
        break;
      case BookmarkOpeningDisposition.newWindow:
        chrome.windows.create({ url });
        break;
      case BookmarkOpeningDisposition.newIncognitoWindow:
        chrome.windows.create({ url, incognito: true });
        break;
      default:
        // fall through
      case BookmarkOpeningDisposition.activeTab:
        chrome.tabs.update({ url, active: true });
        break;
    }
  }

  static openAll(folder: BookmarkTreeNode, startWithNewTab: boolean): void {
    if (!folder.children) {
      return; // this is a bookmark node, not a folder node
    }

    const urls = this.getAllBookmarkUrlsInFolder(folder);

    let disposition = BookmarkOpeningDisposition.activeTab;
    if (startWithNewTab) {
      disposition = BookmarkOpeningDisposition.backgroundTab;
    }

    this.open(urls[0], disposition);

    urls.slice(1).forEach((bookmark: string) => {
      this.open(bookmark, BookmarkOpeningDisposition.backgroundTab);
    });
  }

  private static getAllBookmarkUrlsInFolder(bookmark: BookmarkTreeNode): string[] {
    let bookmarks = [];
    if (bookmark.url) {
      bookmarks.push(bookmark.url);
    }

    if (bookmark.children) {
      bookmark.children.forEach((child) => {
        bookmarks = bookmarks.concat(this.getAllBookmarkUrlsInFolder(child));
      });
    }

    return bookmarks;
  }
}
