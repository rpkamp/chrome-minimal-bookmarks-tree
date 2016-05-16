var data, dataLoaded = false;

function walkTree(treeNode) {
	var data = [];
	for (var c in treeNode.children) {
		var child = treeNode.children[c];

		if (child.url) {
			data.push(child);
		}
		else if (child.children) {
			data = data.concat(walkTree(child));
		}
	}
	return data;
}

function loadData() {
	chrome.bookmarks.getTree(function(x) {
		data = walkTree(x[0]);
	});
	dataLoaded = true;
}
