export interface Settings {
  getString(setting: string): string;
  getNumber(setting: string): number;
  isEnabled(setting: string): boolean;
  set(setting: string, value: string | number | boolean): void;
}
