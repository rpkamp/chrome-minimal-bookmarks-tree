import { hasClass, addClass, removeClass, toggleClass } from '../../src/js/functions';

QUnit.test("hasClass on one class", function (assert) {
  const elem = document.createElement('span');
  elem.className = 'folder';
  assert.equal(hasClass(elem, 'folder'), true)
});

QUnit.test("hasClass on first class of multiple", function (assert) {
  const elem = document.createElement('span');
  elem.className = 'folder open';
  assert.equal(hasClass(elem, 'folder'), true)
});

QUnit.test("hasClass on last class of multiple", function (assert) {
  const elem = document.createElement('span');
  elem.className = 'folder open';
  assert.equal(hasClass(elem, 'open'), true)
});

QUnit.test("hasClass on middle class of multiple", function (assert) {
  const elem = document.createElement('span');
  elem.className = 'folder open nosort';
  assert.equal(hasClass(elem, 'open'), true)
});

QUnit.test("addClass on element without classes", function (assert) {
  const elem = document.createElement('span');
  addClass(elem, 'folder');
  assert.equal(elem.className, 'folder')
});

QUnit.test("addClass on element with one class", function (assert) {
  const elem = document.createElement('span');
  elem.className = 'folder';
  addClass(elem, 'open');
  assert.equal(elem.className, 'folder open')
});

QUnit.test("removeClass on element with one class", function (assert) {
  const elem = document.createElement('span');
  elem.className = 'folder';
  removeClass(elem, 'folder');
  assert.equal(elem.className, '')
});

QUnit.test("removeClass on first class of multiple classes", function (assert) {
  const elem = document.createElement('span');
  elem.className = 'folder open nosort';
  removeClass(elem, 'folder');
  assert.equal(elem.className, 'open nosort')
});

QUnit.test("removeClass on middle class of multiple classes", function (assert) {
  const elem = document.createElement('span');
  elem.className = 'folder open nosort';
  removeClass(elem, 'open');
  assert.equal(elem.className, 'folder nosort')
});

QUnit.test("removeClass on last class of multiple classes", function (assert) {
  const elem = document.createElement('span');
  elem.className = 'folder open nosort';
  removeClass(elem, 'nosort');
  assert.equal(elem.className, 'folder open')
});

QUnit.test('toggleClass to add class to element without classes', function (assert) {
  const elem = document.createElement('span');
  toggleClass(elem, 'folder');
  assert.equal(elem.className, 'folder');
});

QUnit.test('toggleClass to remove class from element with one class', function (assert) {
  const elem = document.createElement('span');
  elem.className = 'folder';
  toggleClass(elem, 'folder');
  assert.equal(elem.className, '');
});

QUnit.test('toggleClass to add class to element with one class', function (assert) {
  const elem = document.createElement('span');
  elem.className = 'folder';
  toggleClass(elem, 'open');
  assert.equal(elem.className, 'folder open');
});

QUnit.test('toggleClass to remove first class from element with multiple classes', function (assert) {
  const elem = document.createElement('span');
  elem.className = 'folder open nosort';
  toggleClass(elem, 'folder');
  assert.equal(elem.className, 'open nosort');
});

QUnit.test('toggleClass to remove middle class from element with multiple classes', function (assert) {
  const elem = document.createElement('span');
  elem.className = 'folder open nosort';
  toggleClass(elem, 'open');
  assert.equal(elem.className, 'folder nosort');
});

QUnit.test('toggleClass to remove last class from element with multiple classes', function (assert) {
  const elem = document.createElement('span');
  elem.className = 'folder open nosort';
  toggleClass(elem, 'nosort');
  assert.equal(elem.className, 'folder open');
});
