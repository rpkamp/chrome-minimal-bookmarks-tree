import PersistentSet from '../../src/browser_action/PersistentSet';

export default function() {
  QUnit.test("Add item to PersistentSet and check if set contains the item", function (assert) {
    const set = new PersistentSet("foo");
    set.clear();
    set.add("123");
    assert.equal(set.contains("123"), true);
  });

  QUnit.test("Delete items from PersistentSet", function (assert) {
    const set = new PersistentSet("foo");
    set.clear();
    set.add("123");
    set.remove("123");
    assert.equal(set.contains("123"), false);
  });

  QUnit.test("Clear PersistentSet", function (assert) {
    const set = new PersistentSet("foo");
    set.clear();
    set.add("123");
    set.add("456");
    set.clear();
    assert.equal(set.contains("123"), false);
    assert.equal(set.contains("456"), false);
  });

  QUnit.test("PersistentSet is persistent", function (assert) {
    const set = new PersistentSet("foo");
    set.clear();
    set.add("123");

    const compareSet = new PersistentSet("foo");
    assert.equal(compareSet.contains("123"), true);
  });

  QUnit.test("PersistentSet elements do not cross keys", function (assert) {
    const set = new PersistentSet("foo");
    set.clear();
    set.add("123");

    const compareSet = new PersistentSet("bar");
    assert.equal(compareSet.contains("123"), false);
  });

  QUnit.test("Removing an item from a PersistentSet does not affect other keys", function (assert) {
    const set = new PersistentSet("foo");
    set.clear();
    set.add("123");

    const compareSet = new PersistentSet("bar");
    compareSet.remove("123");

    assert.equal(set.contains("123"), true);
  });
}
