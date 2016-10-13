function nothing(e) {
  e = e || window.event;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  return false;
}
