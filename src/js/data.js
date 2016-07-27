/* global chrome */
let data;
let dataLoaded = false;

function extractDataFromBookmarks(treeNode) {
  let data = [];
  let child;
  for (child of treeNode.children) {
    if (child.url) {
      data.push(child);
    } else if (child.children) {
      data = data.concat(extractDataFromBookmarks(child));
    }
  }
  return data;
}

function loadData() {
  chrome.bookmarks.getTree(function loadBookmarks(bookmarks) {
    data = extractDataFromBookmarks(bookmarks[0]);
  });
  dataLoaded = true;
}
