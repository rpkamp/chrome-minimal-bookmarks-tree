import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import PersistentSet from "./PersistentSet";

export class TreeRenderer {
  private openFolders: PersistentSet<string>;
  private readonly hideEmptyFolders: boolean;
  private readonly startWithAllFoldersClosed: boolean;

  constructor(openFolders: PersistentSet<string>, hideEmptyFolders: boolean, startWithAllFoldersClosed: boolean) {
    this.openFolders = openFolders;
    this.hideEmptyFolders = hideEmptyFolders;
    this.startWithAllFoldersClosed = startWithAllFoldersClosed;
  }

  renderTree(
    treeNode: BookmarkTreeNode,
    document: Document,
    topLevel: boolean = false,
    visible: boolean = true
  ): HTMLElement | DocumentFragment {
    let wrapper: HTMLElement | DocumentFragment;

    if (topLevel) {
      wrapper = document.createDocumentFragment();
    } else {
      wrapper = document.createElement('ul');
      wrapper.className = 'sub';
      if (visible) {
        wrapper.style.height = 'auto';
      }
    }

    if (typeof treeNode.children === 'undefined') {
      return wrapper;
    }

    treeNode.children.forEach((child: BookmarkTreeNode) => {
      if (typeof child === 'undefined') {
        return;
      }

      if (child.url) {
        wrapper.appendChild(
          this.renderBookmark(child, document)
        );

        return;
      }

      wrapper.appendChild(
        this.renderFolder(
          !this.startWithAllFoldersClosed && this.openFolders.contains(child.id),
          document,
          child
        )
      );
    });

    return wrapper;
  }

  private renderFolder(
    isOpen: boolean,
    document: Document,
    child: chrome.bookmarks.BookmarkTreeNode
  ): HTMLElement {
    const d = document.createElement('li');

    if (typeof child.url !== 'undefined') {
      throw new Error('Element appears to be a bookmark rather than a folder. Unable to render.');
    }

    d.classList.add('folder');
    if (isOpen) {
      d.classList.add('open');
    }

    const folder = document.createElement('span');
    folder.innerText = child.title;
    d.appendChild(folder);

    if (this.hideEmptyFolders && this.isFolderEmpty(child)) {
      // we need to add hidden nodes for these
      // otherwise sorting doesn't work properly
      d.classList.add('hidden');
    } else {
      d.dataset.itemId = child.id;

      if (child.children && child.children.length) {
        if (isOpen) {
          const children = this.renderTree(child, document, false, isOpen);
          d.appendChild(children);
        }
        d.dataset.loaded = isOpen ? '1' : '0';
      }
    }

    return d;
  }

  private renderBookmark(
    child: chrome.bookmarks.BookmarkTreeNode,
    document: Document
  ): HTMLElement {
    if (typeof child.url === 'undefined') {
      throw new Error('Element does not appear to be a bookmark. Unable to render.');
    }

    const d = document.createElement('li');

    d.dataset.url = child.url;
    d.dataset.itemId = child.id;

    const bookmark = document.createElement('span');
    if (!/^\s*$/.test(child.title)) {
      bookmark.innerText = child.title;
    } else {
      bookmark.innerHTML = '&nbsp;';
    }
    bookmark.title = `${child.title} [${child.url}]`;
    bookmark.style.backgroundImage = `url("${this.getFaviconUrl(child.url)}")`;
    bookmark.className = 'bookmark';
    d.appendChild(bookmark);

    return d;
  }

  private getFaviconUrl(url: string): string {
    const urlObj = new URL(chrome.runtime.getURL('/_favicon/'));
    urlObj.searchParams.set('pageUrl', url);
    urlObj.searchParams.set('size', '32');
    return urlObj.toString();
  }

  isFolderEmpty(folder: BookmarkTreeNode): boolean {
    if (typeof folder.children === 'undefined') {
      return false;
    }

    const children: BookmarkTreeNode[] = folder.children;

    if (children.length === 0) {
      return true;
    }

    for (folder of children) {
      if (!this.isFolderEmpty(folder)) {
        return false;
      }
    }

    // all children, plus their children are empty
    return true;
  }
}
