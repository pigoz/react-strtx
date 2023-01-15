import * as React from 'react';
import { useString } from '../src/useString';
import * as s from './strings';

type Props = {};

export function Page(_props: Props) {
  const { tx } = useString();
  return (
    <React.Fragment>
      {tx(s.foo)}
      {tx(s.bar, { v: 'bar1' })}
      {tx(s.baz, { v1: 'baz1', v2: 1 })}
    </React.Fragment>
  );
}
