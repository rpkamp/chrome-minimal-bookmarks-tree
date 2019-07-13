import {LocalStorageSettings} from "../../../src/common/settings/LocalStorageSettings";

test('Set and get number', () => {
  const settings = new LocalStorageSettings({});
  settings.set('test', 1);
  expect(settings.getNumber('test')).toBe(1)
});

test('Set and get string', () => {
  const settings = new LocalStorageSettings({});
  settings.set('test', 'foo');
  expect(settings.getString('test')).toBe('foo')
});

test('Set and get boolean', () => {
  const settings = new LocalStorageSettings({});
  settings.set('test', true);
  expect(settings.isEnabled('test')).toBeTruthy()
});

test('Set string, get number', () => {
  const settings = new LocalStorageSettings({});
  settings.set('test', '1');
  expect(settings.getNumber('test')).toBe(1)
});

test('Set number, get string', () => {
  const settings = new LocalStorageSettings({});
  settings.set('test', 1);
  expect(settings.getString('test')).toBe('1')
});

test('Set multiple', () => {
  const settings = new LocalStorageSettings({});
  settings.set('foo', 1);
  settings.set('bar', 2);
  settings.set('baz', 3);
  expect(settings.getNumber('foo')).toBe(1);
  expect(settings.getNumber('bar')).toBe(2);
  expect(settings.getNumber('baz')).toBe(3);
});

test('Get from default', () => {
  const settings = new LocalStorageSettings({ 'foo': 1 });
  expect(settings.getNumber('foo')).toBe(1);
});

test('Throw error when unable to resolve setting', () => {
  const settings = new LocalStorageSettings({});
  expect(() => { settings.getNumber('not-set') }).toThrow();
});

test('Throw error when expected number is boolean', () => {
  const settings = new LocalStorageSettings({});
  settings.set('foo', true);
  expect(() => { settings.getNumber('foo') }).toThrow();
});

test('Throw error when expected string is boolean', () => {
  const settings = new LocalStorageSettings({});
  settings.set('foo', true);
  expect(() => { settings.getString('foo') }).toThrow();
});

test('Throw error when expected boolean is number', () => {
  const settings = new LocalStorageSettings({});
  settings.set('foo', 5);
  expect(() => { settings.isEnabled('foo') }).toThrow();
});

test('Throw error when expected boolean is string', () => {
  const settings = new LocalStorageSettings({});
  settings.set('foo', 'bar');
  expect(() => { settings.isEnabled('foo') }).toThrow();
});
