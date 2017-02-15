/* global window, document */

import Settings from '../settings';
import PersistentSet from '../PersistentSet';
import {
  nothing,
  getElementData,
  setElementData,
  toggleClass,
  getAncestorsWithClass,
  addClass,
  removeClass,
} from '../functions';

const mbtSettings = new Settings();
const openFolders = new PersistentSet('openfolders');

export function setElementDimensions(tab, selector, preferredWidth, preferredHeight, zoom) {
  const scale = 1 / (zoom / 100);

  const width = scale * Math.min(
    tab.width - 100,
    preferredWidth,
  );

  const height = scale * Math.min(
    tab.height - 100,
    preferredHeight,
  );

  const elem = document.querySelector(selector);
  if (elem === null) {
    return;
  }

  elem.style.width = `${width}px`;
  elem.style.minWidth = `${width}px`;
  elem.style.maxWidth = `${width}px`;
  elem.style.maxHeight = `${height}px`;
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
      wrapper.style.display = 'block';
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
      bookmark.innerText = child.title;
      bookmark.title = `${child.title} [${child.url}]`;
      bookmark.style.backgroundImage = `url("chrome://favicon/${child.url}")`;
      bookmark.style.backgroundRepeat = 'no-repeat';
      d.appendChild(bookmark);
    } else { // folder
      addClass(d, 'folder');
      if (isOpen) {
        addClass(d, 'open');
      }

      const folder = document.createElement('span');
      folder.innerText = child.title;
      d.appendChild(folder);

      if (hideEmptyFolders && child.children && !child.children.length) {
        // we need to add hidden nodes for these
        // otherwise sorting doesn't work properly
        addClass(d, 'hidden');
      } else {
        setElementData(d, 'item-id', child.id);
        d.setAttribute('id', `tree${child.id}`);

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

function handleToggleFolder(element) {
  if (mbtSettings.get('close_old_folder')) {
    element.parentNode.querySelectorAll('.folder.open').forEach((openFolderElement) => {
      if (openFolderElement !== element) {
        removeClass(openFolderElement, 'open');
        openFolderElement.querySelectorAll('.sub').forEach((elementToHide) => {
          // @TODO: slide
          elementToHide.style.display = 'none';
        });
      }
    });
  }

  toggleClass(element, 'open');
  // @TODO: slide
  const elementToToggle = element.querySelectorAll('.sub')[0];
  elementToToggle.style.display =
    elementToToggle.style.display === 'block' ? 'none' : 'block';

  const id = getElementData(elementToToggle.parentNode, 'item-id');
  if (mbtSettings.get('close_old_folder')) {
    const parents = getAncestorsWithClass(element, 'open');
    openFolders.clear();
    if (elementToToggle.style.display === 'block') {
      openFolders.add(id);
    }
    parents.forEach((parent) => {
      openFolders.add(getElementData(parent, 'item-id'));
    });

    return;
  }

  if (elementToToggle.style.display === 'block') {
    openFolders.add(id);

    return;
  }

  openFolders.remove(id);
  elementToToggle.querySelectorAll('li').forEach((folderToHide) => {
    openFolders.remove(getElementData(folderToHide, 'item-id'));
    removeClass(folderToHide, 'open');
    folderToHide.querySelectorAll('.sub').forEach((sub) => {
      sub.style.display = 'none';
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

function handleOpenAllBookmarks(data) {
  if (data.url) {
    window.chrome.tabs.create({
      url: data.url,
      active: false,
    });

    return;
  }

  if (data.children) {
    data.children.forEach((child) => {
      handleOpenAllBookmarks(child);
    });
  }
}

export function openAllBookmarks(folder) {
  window.chrome.bookmarks.getSubTree(getElementData(folder, 'item-id'), (data) => {
    handleOpenAllBookmarks(data[0]);
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

  const windowHeight = window.innerHeight;
  const contextHeight = contextMenu.getBoundingClientRect().height;
  const scrollTop = document.querySelector('#wrapper').scrollTop;
  let topY = scrollTop + offset.y;
  const bottomY = scrollTop + windowHeight;
  if (topY > bottomY - contextHeight) {
    topY = bottomY - contextHeight - 15;
  }

  contextMenu.style.left = `${offset.x}px`;
  contextMenu.style.top = `${topY}px`;
}

function closeEditor(editor) {
  editor.parentNode.removeChild(editor);
  // @TODO slide?
  removeClass(document.querySelector('.selected'), 'selected');
  document.querySelector('#overlay').style.display = 'none';
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
      if (window.confirm('Are you sure you want to delete this folder?')) {
        window.chrome.bookmarks.removeTree(getElementData(folder, 'item-id'), () => {
          folder.parentNode.removeChild(folder);
        });
      }
    });
  });
  contextMenu.querySelector('.edit').addEventListener('click', (subEvent) => {
    const itemId = getElementData(folder, 'item-id');
    contextAction(subEvent, () => {
      const editor = document.createElement('div');
      editor.innerHTML = document.querySelector('#editFolderTemplate').innerHTML;
      editor.setAttribute('id', 'edit_panel');

      document.querySelector('#overlay').appendChild(editor);

      document.querySelector('#folderName').value = folder.querySelector('span').innerText;

      document.querySelector('.cancel').addEventListener('click', () => {
        closeEditor(editor);
      });
      document.querySelector('.save').addEventListener('click', () => {
        window.chrome.bookmarks.update(itemId, {
          title: document.querySelector('#folderName').value,
        });
        folder.querySelector('span').innerText = document.querySelector('#folderName').value;

        closeEditor(editor);
      });

      // @TODO: slide?
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
      if (window.confirm('Are you sure you want to delete this bookmark?')) {
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
      editor.setAttribute('id', 'edit_panel');

      document.querySelector('#overlay').appendChild(editor);

      document.querySelector('#bookmarkName').value = bookmark.querySelector('span').innerText;
      document.querySelector('#bookmarkUrl').value = getElementData(bookmark, 'url');

      document.querySelector('.cancel').addEventListener('click', () => {
        closeEditor(editor);
      });
      document.querySelector('.save').addEventListener('click', () => {
        const span = bookmark.querySelector('span');
        const name = document.querySelector('#bookmarkName').value;
        const url = document.querySelector('#bookmarkUrl').value;

        window.chrome.bookmarks.update(itemId, {
          title: name,
          url: url,
        });

        span.innerText = name;
        span.setAttribute(
          'title',
          `${name} [${url}]`,
        );
        setElementData(bookmark, 'url', url);

        closeEditor(editor);
      });

      // @TODO: slide?
      document.querySelector('#overlay').style.display = 'block';
      document.querySelector('#bookmarkName').addEventListener('keyup', (event) => {
        if (event.keyCode !== 13) {
          return;
        }
        document.querySelector('.save').click();
      });
      document.querySelector('#bookmarkUrl').addEventListener('keyup', (event) => {
        if (event.keyCode !== 13) {
          return;
        }
        document.querySelector('.save').click();
      });
      document.querySelector('#bookmarkName').focus();
    });
  });
  addClass(bookmark, 'selected');
  showContextMenu(contextMenu, offset);
}
