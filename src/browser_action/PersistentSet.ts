export default class PersistentSet<T> {
  private readonly key: string;
  private elements: Array<T>;

  constructor(key: string) {
    this.key = key;
    this.elements = [];
    this.load();
  }

  add(id: T): void {
    const pos = this.elements.indexOf(id);
    if (pos !== -1) {
      return;
    }
    this.elements.push(id);
    this.save();
  }

  remove(id: T): void {
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

  contains(id: T): boolean {
    return this.elements.indexOf(id) > -1;
  }

  load(): void {
    const elements = localStorage.getItem(this.key);
    if (elements !== null) {
      this.elements = JSON.parse(elements);
    }
  }

  save(): void {
    const data = JSON.stringify(this.elements);
    localStorage.setItem(this.key, data);
  }
}
