import {elementIndex} from "../../src/browser_action/functions";

function createNode() {
  const ul = document.createElement('ul');

  const first = document.createElement('li');
  first.className = 'first';

  const second = document.createElement('li');
  second.className = 'second';

  const third = document.createElement('li');
  third.className = 'third';

  ul.appendChild(first);
  ul.appendChild(second);
  ul.appendChild(third);

  return ul;
}

test('detect index of element 0 in list', () => {
  const node = createNode();

  expect(elementIndex(node.querySelector('.first') as HTMLElement)).toBe(0);
});

test('detect index of element 1 in list', () => {
  const node = createNode();

  expect(elementIndex(node.querySelector('.second') as HTMLElement)).toBe(1);
});

test('detect index of element 2 in list', () => {
  const node = createNode();

  expect(elementIndex(node.querySelector('.third') as HTMLElement)).toBe(2);
});

test('detect index of element in container with mixed nodes', () => {
  const parent = document.createElement('div');

  const first = document.createElement('span');
  const second = document.createElement('p');

  parent.appendChild(first);
  parent.appendChild(second);

  expect(elementIndex(second)).toBe(1);
});

test('detect correct index of element in container with useless text nodes', () => {
  const parent = document.createElement('div');

  const first = document.createElement('span');
  const textNode = document.createTextNode(' ');
  const second = document.createElement('p');

  parent.appendChild(first);
  parent.appendChild(textNode);
  parent.appendChild(second);

  expect(elementIndex(second)).toBe(1);
});
