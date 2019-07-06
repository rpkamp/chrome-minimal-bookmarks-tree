import HeightAnimator from './HeightAnimator';
import PersistentSet from './PersistentSet';
import {SettingsFactory} from "../common/settings";
import {getAncestorsWithClass, getElementData, nothing, setElementData,} from '../common/functions';
import {BookmarkOpener, BookmarkOpeningDisposition} from "../common/BookmarkOpener";
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

const mbtSettings = SettingsFactory.create();
const openFolders = new PersistentSet('openfolders');

export function setElementDimensions(elem: HTMLHtmlElement | null, preferredWidth: number, preferredHeight: number) {
  if (elem === null) {
    return;
  }

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

  elem.style.width = `${width}px`;
  elem.style.minWidth = `${width}px`;
  elem.style.maxWidth = `${width}px`;
  elem.style.maxHeight = `${height}px`;
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

function handleToggleFolder(element: HTMLHtmlElement): void {
  const animationDuration = parseInt(<string>mbtSettings.get('animation_duration'), 10);

  if (mbtSettings.get('close_old_folder')) {
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
  if (mbtSettings.get('close_old_folder')) {
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

  window.chrome.bookmarks.getSubTree(getElementData(elem, 'item-id'), (data) => {
    const t = buildTree(
      data[0],
      <boolean>mbtSettings.get('hide_empty_folders'),
      <boolean>mbtSettings.get('start_with_all_folders_closed'),
      false,
      false,
    );
    elem.appendChild(t);
    setElementData(elem, 'loaded', '1');
    handleToggleFolder(elem);
  });
}

export function openAllBookmarks(folder): void {
  window.chrome.bookmarks.getSubTree(getElementData(folder, 'item-id'), (data: BookmarkTreeNode[]) => {
    BookmarkOpener.openAll(data[0], true);
    window.close();
  });
}

export function removeContextMenu(): void {
  const contextMenu = document.querySelector('#contextMenu');
  if (null === contextMenu) {
    return;
  }

  if (!(contextMenu.parentNode instanceof HTMLElement)) {
    return;
  }
  contextMenu.parentNode.removeChild(contextMenu);
}

function contextAction(e, callback): boolean {
  removeContextMenu();
  callback.call();

  return nothing(e);
}

function showContextMenu(contextMenu, offset): void {
  contextMenu.style.left = -10000;

  document.querySelector('body').appendChild(contextMenu);

  const contextClientRect = contextMenu.getBoundingClientRect();

  let yCoordinate = offset.y;
  const windowHeight = window.innerHeight;
  const contextHeight = contextClientRect.height;
  if (yCoordinate > windowHeight - contextHeight) {
    yCoordinate = windowHeight - contextHeight - 15;
  }

  let xCoordinate = offset.x;
  const windowWidth = window.innerWidth;
  const contextWidth = contextClientRect.width;
  if (xCoordinate > windowWidth - contextWidth) {
    xCoordinate = windowWidth - contextWidth - 15;
  }

  contextMenu.style.left = `${xCoordinate}px`;
  contextMenu.style.top = `${yCoordinate}px`;
}

function closePopup(contents): void {
  contents.parentNode.removeChild(contents);
  const selected = document.querySelector('.selected');
  if (null !== selected) {
    selected.classList.remove('selected');
  }
  (document.querySelector('#overlay') as HTMLElement).style.display = 'none';
}

function showConfirm(question, confirmationCallback): void {
  const confirmDialog = document.createElement('div');
  confirmDialog.innerHTML = (document.querySelector('#confirmTemplate') as HTMLElement).innerHTML;
  confirmDialog.setAttribute('id', 'overlayContents');

  confirmDialog.querySelector('.question').innerHTML = question;

  confirmDialog.querySelector('.confirm').addEventListener('click', () => {
    confirmationCallback();
    closePopup(confirmDialog);
  });

  confirmDialog.querySelector('.cancel').addEventListener('click', () => {
    closePopup(confirmDialog);
  });

  document.querySelector('#overlay').appendChild(confirmDialog);
  (document.querySelector('#overlay') as HTMLElement).style.display = 'block';
}

export function showContextMenuFolder(folder, offset): void {
  removeContextMenu();
  const contextMenu = document.createElement('ul');
  contextMenu.className = 'contextMenu';
  contextMenu.innerHTML = (document.querySelector('#folderContextMenuTemplate') as HTMLElement).innerHTML;
  contextMenu.setAttribute('id', 'contextMenu');

  contextMenu.querySelector('.openAll').addEventListener('click', (event) => {
    contextAction(event, () => {
      openAllBookmarks(folder);
    });
  });
  contextMenu.querySelector('.delete').addEventListener('click', (event) => {
    contextAction(event, () => {
      showConfirm(`${window.chrome.i18n.getMessage('deleteBookmark')}<br /><br />${folder.querySelector('span').innerText}`, () => {
        window.chrome.bookmarks.removeTree(getElementData(folder, 'item-id'), () => {
          folder.parentNode.removeChild(folder);
        });
      });
    });
  });
  contextMenu.querySelector('.edit').addEventListener('click', (subEvent) => {
    const itemId = getElementData(folder, 'item-id');
    contextAction(subEvent, () => {
      const editor = document.createElement('div');
      editor.innerHTML = (document.querySelector('#editFolderTemplate') as HTMLElement).innerHTML;
      editor.setAttribute('id', 'overlayContents');

      document.querySelector('#overlay').appendChild(editor);

      (document.querySelector('#folderName') as HTMLInputElement).value = folder.querySelector('span').innerText;

      document.querySelector('.cancel').addEventListener('click', () => {
        closePopup(editor);
      });
      document.querySelector('.save').addEventListener('click', () => {
        window.chrome.bookmarks.update(itemId, {
          title: (document.querySelector('#folderName') as HTMLInputElement).value,
        });
        folder.querySelector('span').innerText = (document.querySelector('#folderName') as HTMLInputElement).value;

        closePopup(editor);
      });

      (document.querySelector('#overlay') as HTMLElement).style.display = 'block';
      (document.querySelector('#folderName') as HTMLElement).focus();
      document.querySelector('#folderName').addEventListener('keyup', (event: KeyboardEvent) => {
        if (event.keyCode !== 13) {
          return;
        }
        (document.querySelector('.save') as HTMLElement).click();
      });
    });
  });
  folder.classList.add('selected');
  showContextMenu(contextMenu, offset);
}

type Offset = {
  x: number;
  y: number;
}

export function showContextMenuBookmark(bookmark: HTMLElement, offset: Offset): void {
  removeContextMenu();

  const contextMenu = document.createElement('ul');
  contextMenu.className = 'contextMenu';
  contextMenu.innerHTML = document.querySelector('#bookmarkContextMenuTemplate').innerHTML;
  contextMenu.setAttribute('id', 'contextMenu');

  contextMenu.querySelector('.delete').addEventListener('click', (event: MouseEvent) => {
    contextAction(event, () => {
      if (mbtSettings.get('confirm_bookmark_deletion')) {
        showConfirm(`${window.chrome.i18n.getMessage('deleteBookmark')}<br /><br />${bookmark.querySelector('span').innerText}`, () => {
          window.chrome.bookmarks.remove(getElementData(bookmark, 'item-id'), () => {
            bookmark.parentNode.removeChild(bookmark);
          });
        });
      } else {
        window.chrome.bookmarks.remove(getElementData(bookmark, 'item-id'), () => {
          bookmark.parentNode.removeChild(bookmark);
        });
      }
    });
  });

  contextMenu.querySelector('.edit').addEventListener('click', (event: MouseEvent) => {
    const itemId = getElementData(bookmark, 'item-id');
    contextAction(event, () => {
      const editor = document.createElement('div');
      editor.innerHTML = document.querySelector('#editBookmarkTemplate').innerHTML;
      editor.setAttribute('id', 'overlayContents');

      document.querySelector('#overlay').appendChild(editor);

      (document.querySelector('#bookmarkName') as HTMLInputElement).value = bookmark.querySelector('span').innerText;
      (document.querySelector('#bookmarkUrl') as HTMLInputElement).value = getElementData(bookmark, 'url');

      document.querySelector('.cancel').addEventListener('click', () => {
        closePopup(editor);
      });
      document.querySelector('.save').addEventListener('click', () => {
        const span = bookmark.querySelector('span');
        const name = (document.querySelector('#bookmarkName') as HTMLInputElement).value;
        const url = (document.querySelector('#bookmarkUrl') as HTMLInputElement).value;

        window.chrome.bookmarks.update(itemId, {
          title: name,
          url,
        });

        span.innerText = name;
        span.setAttribute(
          'title',
          `${name} [${url}]`,
        );
        setElementData(bookmark, 'url', url);

        closePopup(editor);
      });

      (document.querySelector('#overlay') as HTMLElement).style.display = 'block';
      document.querySelector('#bookmarkName').addEventListener('keyup', (keyEvent: KeyboardEvent) => {
        if (keyEvent.keyCode !== 13) {
          return;
        }
        (document.querySelector('.save') as HTMLElement).click();
      });
      document.querySelector('#bookmarkUrl').addEventListener('keyup', (keyEvent: KeyboardEvent) => {
        if (keyEvent.keyCode !== 13) {
          return;
        }
        (document.querySelector('.save') as HTMLElement).click();
      });
      (document.querySelector('#bookmarkName') as HTMLElement).focus();
    });
  });
  contextMenu.querySelector('.open-new').addEventListener('click', (event: MouseEvent) => {
    contextAction(event, () => {
      BookmarkOpener.open(getElementData(bookmark, 'url'), BookmarkOpeningDisposition.backgroundTab);
    });
  });
  contextMenu.querySelector('.open-new-window').addEventListener('click', (event: MouseEvent) => {
    contextAction(event, () => {
      BookmarkOpener.open(getElementData(bookmark, 'url'), BookmarkOpeningDisposition.newWindow);
    });
  });
  contextMenu.querySelector('.open-incognito-window').addEventListener('click', (event: MouseEvent) => {
    contextAction(event, () => {
      BookmarkOpener.open(getElementData(bookmark, 'url'), BookmarkOpeningDisposition.newIncognitoWindow);
    });
  });
  bookmark.classList.add('selected');
  showContextMenu(contextMenu, offset);
}
