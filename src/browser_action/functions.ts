import HeightAnimator from './HeightAnimator';
import PersistentSet from './PersistentSet';
import {SettingsFactory} from '../common/settings/SettingsFactory';
import {BookmarkOpener} from '../common/BookmarkOpener';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import {TreeRenderer} from "./TreeRenderer";

const settings = SettingsFactory.create();
const openFolders: PersistentSet<string> = new PersistentSet('openfolders');
const treeRenderer = new TreeRenderer(
  openFolders,
  settings.isEnabled('hide_empty_folders'),
  settings.isEnabled('start_with_all_folders_closed')
);

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

export function getElementData(element: HTMLElement, key: string): string {
  const data = element.dataset[key];
  if (typeof data === 'undefined') {
    throw new Error('Element does not have data in key "' + key + '"');
  }

  return data;
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

  const id = getElementData(<HTMLElement>elementToToggle.parentNode, 'itemId');
  if (settings.isEnabled('close_old_folder')) {
    openFolders.clear();
    if (isOpen) {
      openFolders.add(id);
    }
    const parents = getAncestorsWithClass(element, 'open');
    parents.forEach((parent) => {
      openFolders.add(getElementData(<HTMLElement>parent, 'itemId'));
    });

    return;
  }

  if (isOpen) {
    openFolders.add(id);

    return;
  }

  openFolders.remove(id);
  elementToToggle.querySelectorAll('li').forEach((folderToHide) => {
    openFolders.remove(getElementData(folderToHide, 'itemId'));
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

  chrome.bookmarks.getSubTree(getElementData(element, 'itemId'), (data) => {
    const t = treeRenderer.renderTree(
      data[0],
      document,
      false,
      false,
    );
    element.appendChild(t);
    element.dataset.loaded = '1';
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
