import {instance, mock, verify, when} from "ts-mockito";
import {LocalStorageSettings} from "../../../src/common/settings/LocalStorageSettings";
import {CachedSettings} from "../../../src/common/settings/CachedSettings";

test('Cache read data locally (strings)', () => {
  const inner = mock(LocalStorageSettings);

  when(inner.getString('foo')).thenReturn('bar');

  const settings = new CachedSettings(instance(inner));

  expect(settings.getString('foo')).toBe('bar');
  expect(settings.getString('foo')).toBe('bar'); // cached

  verify(inner.getString('foo')).once();
});

test('Cache read data locally (numbers)', () => {
  const inner = mock(LocalStorageSettings);

  when(inner.getNumber('foo')).thenReturn(5);

  const settings = new CachedSettings(instance(inner));

  expect(settings.getNumber('foo')).toBe(5);
  expect(settings.getNumber('foo')).toBe(5); // cached

  verify(inner.getNumber('foo')).once();
});

test('Cache read data locally (booleans)', () => {
  const inner = mock(LocalStorageSettings);

  when(inner.isEnabled('foo')).thenReturn(true);

  const settings = new CachedSettings(instance(inner));

  expect(settings.isEnabled('foo')).toBeTruthy();
  expect(settings.isEnabled('foo')).toBeTruthy(); // cached

  verify(inner.isEnabled('foo')).once();
});


test('Pass-through set calls (strings)', () => {
  const inner = mock(LocalStorageSettings);

  const settings = new CachedSettings(instance(inner));

  settings.set('foo', 'bar');

  verify(inner.set('foo', 'bar')).once();
});

test('Pass-through set calls (numbers)', () => {
  const inner = mock(LocalStorageSettings);

  const settings = new CachedSettings(instance(inner));

  settings.set('foo', 5);

  verify(inner.set('foo', 5)).once();
});

test('Pass-through set calls (booleans)', () => {
  const inner = mock(LocalStorageSettings);

  const settings = new CachedSettings(instance(inner));

  settings.set('foo', true);

  verify(inner.set('foo', true)).once();
});

test('Cache set calls (strings)', () => {
  const inner = mock(LocalStorageSettings);

  const settings = new CachedSettings(instance(inner));

  settings.set('foo', 'bar');

  expect(settings.getString('foo')).toBe('bar');

  verify(inner.getString('foo')).never();
});

test('Cache set calls (numbers)', () => {
  const inner = mock(LocalStorageSettings);

  const settings = new CachedSettings(instance(inner));

  settings.set('foo', 5);

  expect(settings.getNumber('foo')).toBe(5);

  verify(inner.getNumber('foo')).never();
});

test('Cache set calls (booleans)', () => {
  const inner = mock(LocalStorageSettings);

  const settings = new CachedSettings(instance(inner));

  settings.set('foo', true);

  expect(settings.isEnabled('foo')).toBe(true);

  verify(inner.isEnabled('foo')).never();
});
