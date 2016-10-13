QUnit.test("Build Simple Node", function (assert) {
  var builder = new HtmlTreeBuilder();
  let node = builder.buildTreeNode({
    id: 1,
    name: 'Foo'
  });
  assert.equal(node.html(), '<ul><li data-id="1">Foo</li></ul>');
});
