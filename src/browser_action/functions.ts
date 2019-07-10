import HeightAnimator from './HeightAnimator';
import PersistentSet from './PersistentSet';
import {SettingsFactory} from '../common/settings';
import {BookmarkOpener, BookmarkOpeningDisposition} from '../common/BookmarkOpener';
import {ContextMenu, ContextMenuEvent, ContextMenuSeparator, ContextMenuTextItem, Offset} from './ContextMenu';
import {ConfirmDialog, EditDialog} from './Dialog';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

const settings = SettingsFactory.create();
const openFolders = new PersistentSet('openfolders');

let contextMenu: ContextMenu | null = null;

// Not enforced by this extension, but hardcoded in chrome.
// So we need to prevent creating a browser action bigger than that, because:
//
//   1. When height > 800 it will cause duplicate vertical scrollbars
//   2. When width > 600 it will cause
//      a) the vertical scrollbar to be out of view
//      b) a horizonal scrollbar to be shown
//
// Also see https://stackoverflow.com/questions/6904755/is-there-a-hardcoded-maximum-height-for-chrome-browseraction-popups
const browserActionMaxHeight = 600;
const browserActionMaxWidth = 800;

export function setElementDimensions(element: HTMLElement | null, preferredWidth: number, preferredHeight: number) {
  if (null === element) {
    return;
  }

  const width: number = Math.floor(
    Math.min(
      browserActionMaxWidth,
      preferredWidth,
    ),
  );

  const height: number = Math.floor(
    Math.min(
      browserActionMaxHeight,
      preferredHeight,
    ),
  );

  element.style.width = `${width}px`;
  element.style.minWidth = `${width}px`;
  element.style.maxWidth = `${width}px`;
  element.style.maxHeight = `${height}px`;
}

function isFolderEmpty(folder: BookmarkTreeNode) {
  if (typeof folder.children === 'undefined') {
    return false;
  }

  const children: BookmarkTreeNode[] = folder.children;

  if (children.length === 0) {
    return true;
  }

  for (folder of children) {
    if (!isFolderEmpty(folder)) {
      return false;
    }
  }

  // all children, plus their children are empty
  return true;
}

export function getElementData(element: Element, key: string): string {
  return element.getAttribute(`data-${key}`);
}

export function setElementData(element: Element, key: string, value: string): void {
  element.setAttribute(`data-${key}`, value);
}

export function buildTree(
  treeNode: BookmarkTreeNode,
  hideEmptyFolders: boolean,
  allFoldersClosed: boolean,
  topLevel: boolean = false,
  visible: boolean = true,
) {
  let wrapper: HTMLElement | DocumentFragment;
  let children: HTMLElement | DocumentFragment;
  let d: HTMLLIElement;
  let isOpen: boolean;

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
    isOpen = !allFoldersClosed && openFolders.contains(child.id);
    d = document.createElement('li');

    if (child.url) { // bookmark
      setElementData(d, 'url', child.url);
      setElementData(d, 'item-id', child.id);

      const bookmark = document.createElement('span');
      if (!/^\s*$/.test(child.title)) {
        bookmark.innerText = child.title;
      } else {
        bookmark.innerHTML = '&nbsp;';
      }
      bookmark.title = `${child.title} [${child.url}]`;
      bookmark.style.backgroundImage = `url("chrome://favicon/${child.url}")`;
      bookmark.className = 'bookmark';
      d.appendChild(bookmark);
    } else { // folder
      d.classList.add('folder');
      if (isOpen) {
        d.classList.add('open');
      }

      const folder = document.createElement('span');
      folder.innerText = child.title;
      d.appendChild(folder);

      if (hideEmptyFolders && isFolderEmpty(child)) {
        // we need to add hidden nodes for these
        // otherwise sorting doesn't work properly
        d.classList.add('hidden');
      } else {
        setElementData(d, 'item-id', child.id);

        if (child.children && child.children.length) {
          if (isOpen) {
            children = buildTree(child, hideEmptyFolders, allFoldersClosed, false, isOpen);
            d.appendChild(children);
          }
          setElementData(d, 'loaded', isOpen ? '1' : '0');
        }
      }
    }

    wrapper.appendChild(d);
  });

  return wrapper;
}

export function slideUp(element: HTMLHtmlElement, duration: number): void {
  const animator = new HeightAnimator(element, 0, duration);
  animator.start();
}

export function slideDown(element: HTMLHtmlElement, duration: number): void {
  const animator = new HeightAnimator(element, 'auto', duration);
  animator.start();
}

export function getAncestorsWithClass(element: Element, className: string): HTMLElement[] {
  const parents = [];

  if (!(element.parentNode instanceof Element)) {
    return parents;
  }

  if (element.parentNode.classList.contains(className)) {
    parents.push(element.parentNode);
  }

  return parents.concat(getAncestorsWithClass(element.parentNode, className));
}

function handleToggleFolder(element: HTMLHtmlElement): void {
  const animationDuration = parseInt(<string>settings.get('animation_duration'), 10);

  if (settings.get('close_old_folder')) {
    if (!(element.parentNode instanceof HTMLElement)) {
      return;
    }

    element.parentNode.querySelectorAll('.folder.open').forEach((openFolderElement: HTMLElement) => {
      if (openFolderElement !== element) {
        openFolderElement.classList.remove('open');
        openFolderElement.querySelectorAll('.sub').forEach((elementToHide: HTMLHtmlElement) => {
          slideUp(elementToHide, animationDuration);
        });
      }
    });
  }

  element.classList.toggle('open');
  const isOpen = element.classList.contains('open');
  const elementToToggle = <HTMLHtmlElement>element.querySelectorAll('.sub')[0];
  if (isOpen) {
    slideDown(elementToToggle, animationDuration);
  } else {
    slideUp(elementToToggle, animationDuration);
  }

  const id = getElementData(<HTMLElement>elementToToggle.parentNode, 'item-id');
  if (settings.get('close_old_folder')) {
    openFolders.clear();
    if (isOpen) {
      openFolders.add(id);
    }
    const parents = getAncestorsWithClass(element, 'open');
    parents.forEach((parent) => {
      openFolders.add(getElementData(parent, 'item-id'));
    });

    return;
  }

  if (isOpen) {
    openFolders.add(id);

    return;
  }

  openFolders.remove(id);
  elementToToggle.querySelectorAll('li').forEach((folderToHide) => {
    openFolders.remove(getElementData(folderToHide, 'item-id'));
    folderToHide.classList.remove('open');
    folderToHide.querySelectorAll('.sub').forEach((sub: HTMLHtmlElement) => {
      slideUp(sub, animationDuration);
    });
  });
}

export function toggleFolder(elem): void {
  if (getElementData(elem, 'loaded') === '1') {
    handleToggleFolder(elem);

    return;
  }

  chrome.bookmarks.getSubTree(getElementData(elem, 'item-id'), (data) => {
    const t = buildTree(
      data[0],
      <boolean>settings.get('hide_empty_folders'),
      <boolean>settings.get('start_with_all_folders_closed'),
      false,
      false,
    );
    elem.appendChild(t);
    setElementData(elem, 'loaded', '1');
    handleToggleFolder(elem);
  });
}

export function openAllBookmarks(folderId: string): void {
  chrome.bookmarks.getSubTree(folderId, (data: BookmarkTreeNode[]) => {
    BookmarkOpener.openAll(data[0], true);
    window.close();
  });
}

export function elementIndex(element: Element): number {
  if (!(element.parentNode instanceof Element)) {
    return -1;
  }

  return Array.from(element.parentNode.childNodes).filter(
    (elem) => elem.nodeType !== Node.TEXT_NODE
  ).indexOf(element);
}

export function destroyContextMenu() {
  if (null === contextMenu) {
    return;
  }

  contextMenu.destroy();
  contextMenu = null;
}

export function showContextMenuFolder(folder: HTMLElement, offset: Offset): void {
  destroyContextMenu();

  folder.classList.add('selected');
  contextMenu = new ContextMenu(
    [
      new ContextMenuTextItem('openAll', chrome.i18n.getMessage('popupOpenAll')),
      new ContextMenuTextItem('edit', chrome.i18n.getMessage('popupEditFolder')),
      new ContextMenuTextItem('delete', chrome.i18n.getMessage('popupDeleteFolder')),
    ],
    (event: ContextMenuEvent) => {
      destroyContextMenu();
      folder.classList.remove('selected');

      const itemId = getElementData(folder, 'item-id');
      switch (event.action) {
        case 'openAll':
          openAllBookmarks(itemId);
          break;

        case 'delete':
          const deleteFolder = () => {
            chrome.bookmarks.removeTree(itemId, () => {
              folder.parentNode.removeChild(folder);
            });
          };
          new ConfirmDialog(
            `${chrome.i18n.getMessage('deleteBookmarkFolder')}<br /><br />${folder.querySelector('span').innerText}`,
            () => { deleteFolder() }
          ).show(window);
          break;

        case 'edit':
          new EditDialog(
            [
              {
                id: 'name',
                label: chrome.i18n.getMessage('bookmarkEditName'),
                value: folder.querySelector('span').innerText
              }
            ],
            (data) => {
              chrome.bookmarks.update(itemId, {title: data.name}, () => {
                folder.querySelector('span').innerText = data.name;
              })
            }
          ).show(window);
          break;
      }
    }
  );

  contextMenu.show(window, offset);
}

export function showContextMenuBookmark(bookmark: HTMLElement, offset: Offset): void {
  destroyContextMenu();

  bookmark.classList.add('selected');
  contextMenu = new ContextMenu(
    [
      new ContextMenuTextItem('edit', chrome.i18n.getMessage('popupEditBookmark')),
      new ContextMenuTextItem('delete', chrome.i18n.getMessage('popupDeleteBookmark')),
      new ContextMenuSeparator(),
      new ContextMenuTextItem('newTab', chrome.i18n.getMessage('popupOpenNewTab')),
      new ContextMenuTextItem('newWindow', chrome.i18n.getMessage('popupOpenNewWindow')),
      new ContextMenuTextItem('newIncognitoWindow', chrome.i18n.getMessage('popupOpenNewIncognitoWindow')),
    ],
    (event) => {
      destroyContextMenu();
      bookmark.classList.remove('selected');

      const url = getElementData(bookmark, 'url');
      const itemId = getElementData(bookmark, 'item-id');
      const name = bookmark.querySelector('span').innerText;

      switch (event.action) {
        case 'edit':
          new EditDialog(
            [
              {
                id: 'name',
                label: chrome.i18n.getMessage('bookmarkEditName'),
                value: name
              },
              {
                id: 'url',
                label: chrome.i18n.getMessage('bookmarkEditUrl'),
                value: url
              }
            ],
            (data) => {
              chrome.bookmarks.update(itemId, {title: data.name, url: data.url}, () => {
                bookmark.querySelector('span').innerText = data.name;
                setElementData(bookmark, 'url', data.url);
              })
            }
          ).show(window);
          break;

        case 'delete':
          const deleteBookmark = () => {
            chrome.bookmarks.remove(itemId, () => {
              bookmark.parentNode.removeChild(bookmark);
            });
          };
          if (settings.get('confirm_bookmark_deletion')) {
            new ConfirmDialog(
              `${chrome.i18n.getMessage('deleteBookmark')}<br /><br />${name}`,
              () => { deleteBookmark() }
            ).show(window);
          } else {
            deleteBookmark();
          }
          break;

        case 'newTab':
          BookmarkOpener.open(url, BookmarkOpeningDisposition.foregroundTab);
          break;

        case 'newWindow':
          BookmarkOpener.open(url, BookmarkOpeningDisposition.newWindow);
          break;

        case 'newIncognitoWindow':
          BookmarkOpener.open(url, BookmarkOpeningDisposition.newIncognitoWindow);
          break;
      }
    });

  contextMenu.show(window, offset);
}
