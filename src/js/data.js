function extractDataFromBookmarks(treeNode) {
  let data = [];
  let child;
  for (child of treeNode.children) {
    if (child.url) {
      data.push(child);
      continue;
    }
    if (child.children) {
      data = data.concat(extractDataFromBookmarks(child));
    }
  }
  return data;
}

(function loadData(chrome) {
  chrome.bookmarks.getTree((bookmarks) => {
    window.data = extractDataFromBookmarks(bookmarks[0]);
  });
  window.dataLoaded = true;
}(window.chrome));
