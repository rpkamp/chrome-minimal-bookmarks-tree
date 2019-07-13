/**
 * @internal
 * Exported for testing only
 */
import {Settings} from "../Settings";

export class CachedSettings implements Settings {
  numberCache: { [s: string]: number; };
  stringCache: { [s: string]: string; };
  booleanCache: { [s: string]: boolean; };
  inner: Settings;

  constructor(inner: Settings) {
    this.numberCache = {};
    this.stringCache = {};
    this.booleanCache = {};
    this.inner = inner;
  }

  set(setting: string, value: string | number | boolean): void {
    if (typeof value == 'string') {
      this.stringCache[setting] = value;
    }
    if (typeof value == 'number') {
      this.numberCache[setting] = value;
    }
    if (typeof value == 'boolean') {
      this.booleanCache[setting] = value;
    }

    this.inner.set(setting, value);
  }

  getNumber(setting: string): number {
    if (this.numberCache.hasOwnProperty(setting)) {
      return this.numberCache[setting];
    }

    const value = this.inner.getNumber(setting);

    this.numberCache[setting] = value;

    return value;
  }

  getString(setting: string): string {
    if (this.stringCache.hasOwnProperty(setting)) {
      return this.stringCache[setting];
    }

    const value = this.inner.getString(setting);

    this.stringCache[setting] = value;

    return value;
  }

  isEnabled(setting: string): boolean {
    if (this.booleanCache.hasOwnProperty(setting)) {
      return this.booleanCache[setting];
    }

    const value = this.inner.isEnabled(setting);

    this.booleanCache[setting] = value;

    return value;
  }
}
