import { hasClass, addClass, removeClass, toggleClass } from '../../../src/common/functions';

test('hasClass on one class', () => {
  const elem = document.createElement('span');
  elem.className = 'folder';
  expect(hasClass(elem, 'folder')).toBe(true);
});

test('hasClass on first class of multiple', () => {
  const elem = document.createElement('span');
  elem.className = 'folder open';
  expect(hasClass(elem, 'folder')).toBe(true);
});

test('hasClass on last class of multiple', () => {
  const elem = document.createElement('span');
  elem.className = 'folder open';
  expect(hasClass(elem, 'open')).toBe(true);
});

test('hasClass on middle class of multiple', () => {
  const elem = document.createElement('span');
  elem.className = 'folder open nosort';
  expect(hasClass(elem, 'open')).toBe(true);
});

test('addClass on element without classes', () => {
  const elem = document.createElement('span');
  addClass(elem, 'folder');
  expect(elem.className).toBe('folder');
});

test('addClass on element with one class', () => {
  const elem = document.createElement('span');
  elem.className = 'folder';
  addClass(elem, 'open');
  expect(elem.className).toBe('folder open');
});

 test('removeClass on element with one class', () => {
  const elem = document.createElement('span');
  elem.className = 'folder';
  removeClass(elem, 'folder');
  expect(elem.className).toBe('');
});

 test('removeClass on first class of multiple classes', () => {
  const elem = document.createElement('span');
  elem.className = 'folder open nosort';
  removeClass(elem, 'folder');
  expect(elem.className).toBe('open nosort');
});

 test('removeClass on middle class of multiple classes', () => {
  const elem = document.createElement('span');
  elem.className = 'folder open nosort';
  removeClass(elem, 'open');
  expect(elem.className).toBe('folder nosort');
});

 test('removeClass on last class of multiple classes', () => {
  const elem = document.createElement('span');
  elem.className = 'folder open nosort';
  removeClass(elem, 'nosort');
  expect(elem.className).toBe('folder open');
});

 test('toggleClass to add class to element without classes', () => {
  const elem = document.createElement('span');
  toggleClass(elem, 'folder');
  expect(elem.className).toBe('folder');
});

test('toggleClass to remove class from element with one class', () => {
  const elem = document.createElement('span');
  elem.className = 'folder';
  toggleClass(elem, 'folder');
  expect(elem.className).toBe('');
});

 test('toggleClass to add class to element with one class', () => {
  const elem = document.createElement('span');
  elem.className = 'folder';
  toggleClass(elem, 'open');
  expect(elem.className).toBe('folder open');
});

 test('toggleClass to remove first class from element with multiple classes', () => {
  const elem = document.createElement('span');
  elem.className = 'folder open nosort';
  toggleClass(elem, 'folder');
  expect(elem.className).toBe('open nosort');
});

 test('toggleClass to remove middle class from element with multiple classes', () => {
  const elem = document.createElement('span');
  elem.className = 'folder open nosort';
  toggleClass(elem, 'open');
  expect(elem.className).toBe('folder nosort');
});

 test('toggleClass to remove last class from element with multiple classes', () => {
  const elem = document.createElement('span');
  elem.className = 'folder open nosort';
  toggleClass(elem, 'nosort');
  expect(elem.className).toBe('folder open');
});
