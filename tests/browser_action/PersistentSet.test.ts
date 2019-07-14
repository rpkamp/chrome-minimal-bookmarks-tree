import PersistentSet from '../../src/browser_action/PersistentSet';

test('Add item to PersistentSet and check if set contains the item', () => {
  const set = new PersistentSet('foo');
  set.clear();
  set.add('123');
  expect(set.contains('123')).toBe(true);
});

test('Delete items from PersistentSet', () => {
  const set = new PersistentSet('foo');
  set.clear();
  set.add('123');
  set.remove('123');
  expect(set.contains('123')).toBe(false);
});

test('Clear PersistentSet', () => {
  const set = new PersistentSet('foo');
  set.clear();
  set.add('123');
  set.add('456');
  set.clear();
  expect(set.contains('123')).toBe(false);
  expect(set.contains('456')).toBe(false);
});

test('PersistentSet is persistent', () => {
  const set = new PersistentSet('foo');
  set.clear();
  set.add('123');

  const compareSet = new PersistentSet('foo');
  expect(compareSet.contains('123')).toBe(true);
});

test('PersistentSet elements do not cross keys', () => {
  const set = new PersistentSet('foo');
  set.clear();
  set.add('123');

  const compareSet = new PersistentSet('bar');
  expect(compareSet.contains('123')).toBe(false);
});

test('Removing an item from a PersistentSet does not affect other keys', () => {
  const set = new PersistentSet('foo');
  set.clear();
  set.add('123');

  const compareSet = new PersistentSet('bar');
  compareSet.remove('123');

  expect(set.contains('123')).toBe(true);
});
