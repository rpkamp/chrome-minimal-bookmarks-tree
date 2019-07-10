import * as autoScroll from 'dom-autoscroller';
import * as dragula from '../../node_modules/dragula/dragula';
import {elementIndex, getElementData} from "./functions";
import BookmarkDestinationArg = chrome.bookmarks.BookmarkDestinationArg;

export function initDragDrop(bookmaksElement: Element, wrapper: Element) {
  let initialIndexOfDraggable: number | null = null;

  const drake = dragula([bookmaksElement], {
    isContainer: element => element.classList.contains('sub'),
    moves: element => !element.classList.contains('nosort'),
    accepts: (element, target) => {
      if (element.parentNode.getAttribute('id') === 'bookmarks' && elementIndex(element) === 0) {
        return false;
      }

      return element.classList.contains('folder') || target.classList.contains('sub');
    },
    revertOnSpill: true,
  }).on('drag', (element) => {
    initialIndexOfDraggable = elementIndex(element);
  }).on('drop', (element) => {
    const index = elementIndex(element);
    if (-1 === index) {
      return;
    }

    const options: BookmarkDestinationArg = {index};

    if (options.index > initialIndexOfDraggable) {
      // we need to compensate for the original element that was
      // in the tree but has been moved down
      options.index++;
    }

    if (element.parentNode.getAttribute('id') === 'bookmarks') {
      options.index--;
    } else {
      options.parentId = getElementData(element.parentNode.parentNode, 'item-id');
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
