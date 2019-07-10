// @ts-ignore
import * as autoScroll from 'dom-autoscroller';
// @ts-ignore
import * as dragula from '../../node_modules/dragula/dragula';

import {elementIndex, getElementData} from "./functions";
import BookmarkDestinationArg = chrome.bookmarks.BookmarkDestinationArg;

export function initDragDrop(bookmaksElement: Element, wrapper: Element) {
  let initialIndexOfDraggable: number | null = null;

  const drake = dragula([bookmaksElement], {
    isContainer: (element: Element) => element.classList.contains('sub'),
    moves: (element: Element) => !element.classList.contains('nosort'),
    accepts: (element: Element, target: Element) => {
      if ((element.parentNode as Element).getAttribute('id') === 'bookmarks' && elementIndex(element) === 0) {
        return false;
      }

      return element.classList.contains('folder') || target.classList.contains('sub');
    },
    revertOnSpill: true,
  }).on('drag', (element: Element) => {
    initialIndexOfDraggable = elementIndex(element);
  }).on('drop', (element: Element) => {
    const index = <number>elementIndex(element);
    if (-1 === index) {
      return;
    }

    if (null === initialIndexOfDraggable) {
      return;
    }

    const options = {index: index};

    if (options.index > initialIndexOfDraggable) {
      // we need to compensate for the original element that was
      // in the tree but has been moved down
      options.index++;
    }

    if ((element.parentNode as Element).getAttribute('id') === 'bookmarks') {
      options.index--;
    } else {
      (options as BookmarkDestinationArg).parentId = getElementData((element.parentNode as Element).parentNode as Element, 'item-id');
    }

    chrome.bookmarks.move(getElementData(element, 'item-id'), options);
  });

  autoScroll(
    [wrapper],
    {
      margin: 20,
      maxSpeed: 5,
      scrollWhenOutside: true,
      autoScroll: function autoScrollCheck() {
        return this.down && drake.dragging;
      }
  });
}
