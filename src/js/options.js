/* global window,document */

import Settings from './settings';
import {
  nothing,
  addEventListenerMulti,
  setBrowserActionIcon,
  translateDocument,
} from './functions';

(function init(settings) {
  const checkboxes = window.document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    const id = checkbox.getAttribute('id');
    if (settings.get(id)) {
      checkbox.setAttribute('checked', 'checked');
    }
    addEventListenerMulti(checkbox, 'click keyup', () => {
      settings.set(id, checkbox.checked);
    });
  });

  const dropdowns = window.document.querySelectorAll('select');
  dropdowns.forEach((dropdown) => {
    const id = dropdown.getAttribute('id');
    dropdown.value = settings.get(id);
    addEventListenerMulti(dropdown, 'change click keyup', () => {
      settings.set(id, dropdown.value);
      if (id === 'icon') {
        setBrowserActionIcon(dropdown.value);
      }
    });
  });

  const numericInputs = window.document.querySelectorAll('input[type="number"]');
  numericInputs.forEach((numericInput) => {
    const id = numericInput.getAttribute('id');
    numericInput.value = settings.get(id);
    addEventListenerMulti(numericInput, 'change keyup', () => {
      const value = parseInt(numericInput.value, 10);
      const minValue = parseInt(numericInput.getAttribute('min'), 10);
      const maxValue = parseInt(numericInput.getAttribute('max'), 10);
      if (isNaN(value) || value < minValue || value > maxValue) {
        numericInput.style.border = '1px solid red';
        return;
      }
      numericInput.style.border = '';
      settings.set(id, numericInput.value);
    });
  });

  document.querySelector('.license-toggle').addEventListener('click', (event) => {
    document.querySelector('#license').style.display = 'block';
    document.querySelector('.license-toggle').style.display = 'none';
    return nothing(event);
  });

  translateDocument(window.document);
}(new Settings()));
