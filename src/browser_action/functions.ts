import HeightAnimator from './HeightAnimator';
import PersistentSet from './PersistentSet';
import {SettingsFactory} from '../common/settings/SettingsFactory';
import {BookmarkOpener} from '../common/BookmarkOpener';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

const settings = SettingsFactory.create();
const openFolders = new PersistentSet('openfolders');

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
  const data = element.getAttribute(`data-${key}`);
  if (null === data) {
    throw new Error('Element does not have data in key "' + key + '"');
  }

  return data;
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

export function slideUp(element: HTMLElement, duration: number): void {
  const animator = new HeightAnimator(element, 0, duration);
  animator.start();
}

export function slideDown(element: HTMLElement, duration: number): void {
  const animator = new HeightAnimator(element, 'auto', duration);
  animator.start();
}

export function getAncestorsWithClass(element: Element, className: string): Element[] {
  const parents: Element[] = [];

  if (!(element.parentNode instanceof Element)) {
    return parents;
  }

  if (element.parentNode.classList.contains(className)) {
    parents.push(element.parentNode);
  }

  return parents.concat(getAncestorsWithClass(element.parentNode, className));
}

function handleToggleFolder(element: HTMLElement): void {
  const animationDuration = settings.getNumber('animation_duration');

  if (settings.isEnabled('close_old_folder')) {
    if (!(element.parentNode instanceof HTMLElement)) {
      return;
    }

    element.parentNode.querySelectorAll('.folder.open').forEach((openFolderElement: Element) => {
      if (openFolderElement !== element) {
        openFolderElement.classList.remove('open');
        openFolderElement.querySelectorAll('.sub').forEach((elementToHide: Element) => {
          slideUp(<HTMLElement>elementToHide, animationDuration);
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
  if (settings.isEnabled('close_old_folder')) {
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
    folderToHide.querySelectorAll('.sub').forEach((sub: Element) => {
      slideUp(<HTMLElement>sub, animationDuration);
    });
  });
}

export function toggleFolder(element: HTMLElement): void {
  if (getElementData(element, 'loaded') === '1') {
    handleToggleFolder(element);

    return;
  }

  chrome.bookmarks.getSubTree(getElementData(element, 'item-id'), (data) => {
    const t = buildTree(
      data[0],
      settings.isEnabled('hide_empty_folders'),
      settings.isEnabled('start_with_all_folders_closed'),
      false,
      false,
    );
    element.appendChild(t);
    setElementData(element, 'loaded', '1');
    handleToggleFolder(element);
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

  return <number>Array.from(element.parentNode.childNodes).filter(
    (elem) => elem.nodeType !== Node.TEXT_NODE
  ).indexOf(element);
}
