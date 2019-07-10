export function nothing(e: Event) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  return false;
}

export function setBrowserActionIcon(icon: string): void {
  const iconPaths: { [s: string]: string } = {
    default: '/icons/bookmark48.png',
    star: '/icons/black-star.png',
    star_empty: '/icons/black-open-star.png',
    white_star: '/icons/white-star.png',
    white_star_empty: '/icons/white-open-star.png',
  };

  if (!iconPaths.hasOwnProperty(icon)) {
    return;
  }

  chrome.browserAction.setIcon({
    path: iconPaths[icon],
  });
}

export function translateDocument(document: Document): void {
  const translatableElements = document.querySelectorAll('[data-i18n-key]');
  translatableElements.forEach((translatableElement: Element) => {
    const key = translatableElement.getAttribute('data-i18n-key');
    if (null === key) {
      return;
    }

    const translation = chrome.i18n.getMessage(key);
    if (translation !== '') {
      translatableElement.innerHTML = translation;
    }
  });
}
