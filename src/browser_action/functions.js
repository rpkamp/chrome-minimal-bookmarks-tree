/* global window, document */

import SettingsFactory from '../common/settings_factory';
import HeightAnimator from './HeightAnimator';
import PersistentSet from './PersistentSet';
import {
  nothing,
  getElementData,
  setElementData,
  toggleClass,
  getAncestorsWithClass,
  addClass,
  hasClass,
  removeClass,
  handleOpenAllBookmarks,
  openBookmark,
} from '../common/functions';

const mbtSettings = SettingsFactory.create();
const openFolders = new PersistentSet('openfolders');

export function setElementDimensions(elem, preferredWidth, preferredHeight, zoom) {
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

  const scale = zoom / 100;
  const inverseScale = 1 / scale;

  const width = Math.floor(
    Math.min(
      inverseScale * browserActionMaxWidth,
      scale * preferredWidth,
    ),
  );

  const height = Math.floor(
    Math.min(
      inverseScale * browserActionMaxHeight,
      scale * preferredHeight,
    ),
  );

  elem.style.width = `${width}px`;
  elem.style.minWidth = `${width}px`;
  elem.style.maxWidth = `${width}px`;
  elem.style.maxHeight = `${height}px`;
}

function isFolderEmpty(folder) {
  if (!folder.children) {
    return false;
  }

  if (folder.children && folder.children.length === 0) {
    return true;
  }

  /* eslint-disable */
  for (folder of folder.children) {
    if (!isFolderEmpty(folder)) {
      return false;
    }
  }
  /* eslint-enable */

  // all children, plus their children are empty
  return true;
}

export function buildTree(
  treeNode,
  hideEmptyFolders,
  topLevel = false,
  visible = true,
) {
  let wrapper;
  let d;
  let children;
  let isOpen;

  if (topLevel) {
    wrapper = document.createDocumentFragment();
  } else {
    wrapper = document.createElement('ul');
    wrapper.className = 'sub';
    if (visible) {
      wrapper.style.height = 'auto';
    }
  }

  treeNode.children.forEach((child) => {
    if (typeof child === 'undefined') {
      return;
    }
    isOpen = openFolders.contains(child.id);
    d = document.createElement('li');

    if (child.url) { // url
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
      addClass(d, 'folder');
      if (isOpen) {
        addClass(d, 'open');
      }

      const folder = document.createElement('span');
      folder.innerText = child.title;
      d.appendChild(folder);

      if (hideEmptyFolders && isFolderEmpty(child)) {
        // we need to add hidden nodes for these
        // otherwise sorting doesn't work properly
        addClass(d, 'hidden');
      } else {
        setElementData(d, 'item-id', child.id);

        if (child.children && child.children.length) {
          if (isOpen) {
            children = buildTree(child, hideEmptyFolders, false, isOpen);
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

export function slideUp(element, duration) {
  const animator = new HeightAnimator(element, 0, duration);
  animator.start();
}

export function slideDown(element, duration) {
  const animator = new HeightAnimator(element, 'auto', duration);
  animator.start();
}

function handleToggleFolder(element) {
  const animationDuration = parseInt(mbtSettings.get('animation_duration'), 10);

  if (mbtSettings.get('close_old_folder')) {
    element.parentNode.querySelectorAll('.folder.open').forEach((openFolderElement) => {
      if (openFolderElement !== element) {
        removeClass(openFolderElement, 'open');
        openFolderElement.querySelectorAll('.sub').forEach((elementToHide) => {
          slideUp(elementToHide, animationDuration);
        });
      }
    });
  }

  toggleClass(element, 'open');
  const isOpen = hasClass(element, 'open');
  const elementToToggle = element.querySelectorAll('.sub')[0];
  if (isOpen) {
    slideDown(elementToToggle, animationDuration);
  } else {
    slideUp(elementToToggle, animationDuration);
  }

  const id = getElementData(elementToToggle.parentNode, 'item-id');
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
    removeClass(folderToHide, 'open');
    folderToHide.querySelectorAll('.sub').forEach((sub) => {
      slideUp(sub, animationDuration);
    });
  });
}

export function toggleFolder(elem) {
  if (getElementData(elem, 'loaded') === '1') {
    handleToggleFolder(elem);

    return;
  }

  window.chrome.bookmarks.getSubTree(getElementData(elem, 'item-id'), (data) => {
    const t = buildTree(
      data[0],
      mbtSettings.get('hide_empty_folders'),
      false,
      false,
    );
    elem.appendChild(t);
    setElementData(elem, 'loaded', '1');
    handleToggleFolder(elem);
  });
}

export function openAllBookmarks(folder) {
  window.chrome.bookmarks.getSubTree(getElementData(folder, 'item-id'), (data) => {
    handleOpenAllBookmarks(data[0], true);
    window.close();
  });
}

export function removeContextMenu() {
  const contextMenu = document.querySelector('#contextMenu');
  if (!contextMenu) {
    return;
  }
  contextMenu.parentNode.removeChild(contextMenu);
}

function contextAction(e, callback) {
  removeContextMenu();
  callback.call();
  return nothing(e);
}

function showContextMenu(contextMenu, offset) {
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

function closePopup(contents) {
  contents.parentNode.removeChild(contents);
  removeClass(document.querySelector('.selected'), 'selected');
  document.querySelector('#overlay').style.display = 'none';
}

function showConfirm(question, confirmationCallback) {
  const confirmDialog = document.createElement('div');
  confirmDialog.innerHTML = document.querySelector('#confirmTemplate').innerHTML;
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
  document.querySelector('#overlay').style.display = 'block';
}

export function showContextMenuFolder(folder, offset) {
  removeContextMenu();
  const contextMenu = document.createElement('ul');
  contextMenu.className = 'contextMenu';
  contextMenu.innerHTML = document.querySelector('#folderContextMenuTemplate').innerHTML;
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
      editor.innerHTML = document.querySelector('#editFolderTemplate').innerHTML;
      editor.setAttribute('id', 'overlayContents');

      document.querySelector('#overlay').appendChild(editor);

      document.querySelector('#folderName').value = folder.querySelector('span').innerText;

      document.querySelector('.cancel').addEventListener('click', () => {
        closePopup(editor);
      });
      document.querySelector('.save').addEventListener('click', () => {
        window.chrome.bookmarks.update(itemId, {
          title: document.querySelector('#folderName').value,
        });
        folder.querySelector('span').innerText = document.querySelector('#folderName').value;

        closePopup(editor);
      });

      document.querySelector('#overlay').style.display = 'block';
      document.querySelector('#folderName').focus();
      document.querySelector('#folderName').addEventListener('keyup', (event) => {
        if (event.keyCode !== 13) {
          return;
        }
        document.querySelector('.save').click();
      });
    });
  });
  addClass(folder, 'selected');
  showContextMenu(contextMenu, offset);
}

export function showContextMenuBookmark(bookmark, offset) {
  removeContextMenu();
  const contextMenu = document.createElement('ul');
  contextMenu.className = 'contextMenu';
  contextMenu.innerHTML = document.querySelector('#bookmarkContextMenuTemplate').innerHTML;
  contextMenu.setAttribute('id', 'contextMenu');

  contextMenu.querySelector('.delete').addEventListener('click', (event) => {
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
  contextMenu.querySelector('.edit').addEventListener('click', (event) => {
    const itemId = getElementData(bookmark, 'item-id');
    contextAction(event, () => {
      const editor = document.createElement('div');
      editor.innerHTML = document.querySelector('#editBookmarkTemplate').innerHTML;
      editor.setAttribute('id', 'overlayContents');

      document.querySelector('#overlay').appendChild(editor);

      document.querySelector('#bookmarkName').value = bookmark.querySelector('span').innerText;
      document.querySelector('#bookmarkUrl').value = getElementData(bookmark, 'url');

      document.querySelector('.cancel').addEventListener('click', () => {
        closePopup(editor);
      });
      document.querySelector('.save').addEventListener('click', () => {
        const span = bookmark.querySelector('span');
        const name = document.querySelector('#bookmarkName').value;
        const url = document.querySelector('#bookmarkUrl').value;

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

      document.querySelector('#overlay').style.display = 'block';
      document.querySelector('#bookmarkName').addEventListener('keyup', (keyEvent) => {
        if (keyEvent.keyCode !== 13) {
          return;
        }
        document.querySelector('.save').click();
      });
      document.querySelector('#bookmarkUrl').addEventListener('keyup', (keyEvent) => {
        if (keyEvent.keyCode !== 13) {
          return;
        }
        document.querySelector('.save').click();
      });
      document.querySelector('#bookmarkName').focus();
    });
  });
  contextMenu.querySelector('.open-new').addEventListener('click', (event) => {
    contextAction(event, () => {
      openBookmark(getElementData(bookmark, 'url'), 'background');
    });
  });
  contextMenu.querySelector('.open-new-window').addEventListener('click', (event) => {
    contextAction(event, () => {
      openBookmark(getElementData(bookmark, 'url'), 'new-window');
    });
  });
  contextMenu.querySelector('.open-incognito-window').addEventListener('click', (event) => {
    contextAction(event, () => {
      openBookmark(getElementData(bookmark, 'url'), 'new-incognito-window');
    });
  });
  addClass(bookmark, 'selected');
  showContextMenu(contextMenu, offset);
}
