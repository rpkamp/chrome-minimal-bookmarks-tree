import { elementIndex } from '../../src/js/functions';

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

export default function() {
  QUnit.test("detect index of element 0 in list", function (assert) {
    const node = createNode();

    assert.equal(elementIndex(node.querySelector('.first')), 0);
  });

  QUnit.test("detect index of element 1 in list", function (assert) {
    const node = createNode();

    assert.equal(elementIndex(node.querySelector('.second')), 1);
  });

  QUnit.test("detect index of element 2 in list", function (assert) {
    const node = createNode();

    assert.equal(elementIndex(node.querySelector('.third')), 2);
  });

  QUnit.test("detect index of element in container with mixed nodes", function(assert) {
    const parent = document.createElement('div');

    const first = document.createElement('span');
    const second = document.createElement('p');

    parent.appendChild(first);
    parent.appendChild(second);

    assert.equal(elementIndex(second), 1);
  });

  QUnit.test("detect correct index of element in container with useless text nodes", function(assert) {
    const parent = document.createElement('div');

    const first = document.createElement('span');
    const textNode = document.createTextNode(' ');
    const second = document.createElement('p');

    parent.appendChild(first);
    parent.appendChild(textNode);
    parent.appendChild(second);

    assert.equal(elementIndex(second), 1);
  });
}
