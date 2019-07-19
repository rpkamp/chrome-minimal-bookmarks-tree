import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import Tab = chrome.tabs.Tab;

export enum BookmarkOpeningDisposition {
  activeTab,
  foregroundTab,
  backgroundTab,
  newWindow,
  newIncognitoWindow
}

export class BookmarkOpener {
  static open(url: string, disposition: BookmarkOpeningDisposition): Promise<void> {
    return new Promise((resolve, reject) => {
      switch (disposition) {
        case BookmarkOpeningDisposition.foregroundTab:
          chrome.tabs.create({ url, active: true });
          resolve();
          break;
        case BookmarkOpeningDisposition.backgroundTab:
          chrome.tabs.create({ url, active: false });
          resolve();
          break;
        case BookmarkOpeningDisposition.newWindow:
          chrome.windows.create({ url });
          resolve();
          break;
        case BookmarkOpeningDisposition.newIncognitoWindow:
          chrome.windows.create({ url, incognito: true });
          resolve();
          break;
        default:
        // fall through
        case BookmarkOpeningDisposition.activeTab:
          const bookmarklet = /^javascript:(.*)/i.exec(url);
          if (bookmarklet && bookmarklet[1]) {
            const origins = {
              origins: ['http://*/', 'https://*/', 'file://*/']
            };
            chrome.permissions.request(
              origins,
              function (granted: boolean) {
                if (!granted) {
                  reject();
                  return;
                }

                const execScript = `(code) => {
                const script = document.createElement('script');
                script.textContent = code;
                document.head.appendChild(script).remove();
              }`;
                chrome.tabs.query({ active: true }, (tabs: Tab[]) => {
                  chrome.tabs.executeScript(<number>tabs[0].id, {
                    code: `(${execScript})(${
                      JSON.stringify(decodeURIComponent(bookmarklet[1]))
                      })`,
                  });
                  resolve();
                });
              }
            );
          } else {
            chrome.tabs.update({url, active: true});
            resolve();
          }
          break;
      }
    });
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
    let bookmarks: string[] = [];
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
