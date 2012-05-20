var data = [];

function walkTree(treeNode) {
		for (var c in treeNode.children) {
				child = treeNode.children[c];
				
				if (child.url) {
						data.push({title: child.title, url: child.url});
				}
				
				if (child.children) {
						walkTree(child);
				}
		}
}

chrome.bookmarks.getTree(function(x) {
		walkTree(x[0]);
});