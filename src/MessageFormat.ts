import { IntlMessageFormat } from 'intl-messageformat';
import { S, Vars } from './useString';
import { z } from 'zod';
import { pipe } from '@fp-ts/data/Function';
import { Narrow } from './narrow';

export function mfmt<V extends Vars>(value: S<V>, vars: Narrow<V>) {
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
    console.log(`error in '${String(value._k)}'`);
    console.error(e);
    return value;
  }
}

function cleanHtml(src: string) {
  return pipe(
    src,
    replaceAll("'<b>'", '<b>'),
    replaceAll("'</b>'", '</b>'),
    replaceAll('<b>', "'<b>'"),
    replaceAll('</b>', "'</b>'"),
  );
}

export const replaceAll = (src: string, dst: string) => (target: string) =>
  target.replace(new RegExp(src, 'g'), dst);
