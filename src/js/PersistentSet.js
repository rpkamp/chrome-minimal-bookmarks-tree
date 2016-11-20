export default class PersistentSet {
  constructor(key) {
    this.key = key;
    this.elements = [];
    this.load();
  }

  add(id) {
    const pos = this.elements.indexOf(id);
    if (pos !== -1) {
      return;
    }
    this.elements.push(id);
    this.save();
  }

  remove(id) {
    const pos = this.elements.indexOf(id);
    if (pos === -1) {
      return;
    }
    this.elements.splice(pos, 1);
    this.save();
  }

  clear() {
    this.elements = [];
    this.save();
  }

  contains(id) {
    return this.elements.indexOf(id) > -1;
  }

  load() {
    const elements = localStorage.getItem(this.key);
    if (elements !== null) {
      this.elements = JSON.parse(elements);
    }
  }

  save() {
    const data = JSON.stringify(this.elements);
    localStorage.setItem(this.key, data);
  }
}
