import { make } from '../src/useString';

export const foo = make('foo', 'my foo string');
export const bar = make<{ v: 'bar1' | 'bar2' }>(
  'bar',
  '{v, select, bar1{1} bar2{2}}',
);

export const baz = make<{ v1: 'baz1' | 'baz2'; v2: number }>(
  'bar',
  '{v1, select, baz1{1} baz2{2}}{v2}',
);
