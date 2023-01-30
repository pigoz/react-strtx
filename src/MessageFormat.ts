import { IntlMessageFormat } from 'intl-messageformat';
import { S, Vars } from './useString';
import { z } from 'zod';
import { pipe } from '@fp-ts/data/Function';
import { Narrow } from './narrow';

export function mfmt<V extends Vars>(s: S<V>, vars: Narrow<V>): string {
  const value = s.value;

  try {
    // TODO make it-IT configurable
    const msg = new IntlMessageFormat(cleanHtml(value), 'it-IT');
    const result = z.string().safeParse(msg.format(vars as Vars));
    if (result.success) {
      return result.data;
    } else {
      console.error('unexpected message format result', JSON.stringify(result));
      return value;
    }
  } catch (e) {
    console.log(`error in '${String(s._k)}'`);
    console.error(e);
    return value;
  }
}

function cleanHtml(src: string) {
  const replacements = [
    ["'<b>'", '<b>'],
    ["'</b>'", '</b>'],
    ['<b>', "'<b>'"],
    ['</b>', "'</b>'"],
  ] as const;

  return replacements.reduce(
    (acc, cur) => replaceAll(cur[0], cur[1], acc),
    src,
  );
}

export const replaceAll = (src: string, dst: string, target: string) =>
  target.replace(new RegExp(src, 'g'), dst);
