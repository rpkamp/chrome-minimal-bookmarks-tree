import {CachedSettings, LocalStorageSettings, Settings} from '../../src/common/settings';
import {instance, mock, verify, when} from "ts-mockito";
import {exportAllDeclaration} from "@babel/types";

test('Simple set and get', () => {
  const settings = new LocalStorageSettings({});
  settings.set('test', 1);
  expect(settings.get('test')).toBe(1)
});

test('Set multiple', () => {
  const settings = new LocalStorageSettings({});
  settings.set('foo', 1);
  settings.set('bar', 2);
  settings.set('baz', 3);
  expect(settings.get('foo')).toBe(1);
  expect(settings.get('bar')).toBe(2);
  expect(settings.get('baz')).toBe(3);
});

test('Get from default', () => {
  const settings = new LocalStorageSettings({ 'foo': 1 });
  expect(settings.get('foo')).toBe(1);
});

test('Get null if not set', () => {
  const settings = new LocalStorageSettings({});
  expect(settings.get('not-set')).toBe(null);
});

test('Cache read data locally', () => {
  const inner = mock(LocalStorageSettings);

  when(inner.get('foo')).thenReturn('bar');

  const settings = new CachedSettings(instance(inner));

  expect(settings.get('foo')).toBe('bar');
  expect(settings.get('foo')).toBe('bar'); // cached

  verify(inner.get('foo')).once();
});

test('Pass-through set calls', () => {
  const inner = mock(LocalStorageSettings);

  const settings = new CachedSettings(instance(inner));

  settings.set('foo', 'bar');

  verify(inner.set('foo', 'bar')).once();
});

test('Cache set calls', () => {
  const inner = mock(LocalStorageSettings);

  const settings = new CachedSettings(instance(inner));

  settings.set('foo', 'bar');

  expect(settings.get('foo')).toBe('bar');

  verify(inner.get('foo')).never();
});
