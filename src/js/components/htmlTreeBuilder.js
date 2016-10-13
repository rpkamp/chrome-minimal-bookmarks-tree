'use strict';

class HtmlTreeBuilder {
  constructor() {

  }

  buildTreeNode(nodeInfo) {
    const root = $('<ul>');
    const node = $('<li>').data('id', nodeInfo.id).text(nodeInfo.name);
    root.append(node);
    return root;
  }
}