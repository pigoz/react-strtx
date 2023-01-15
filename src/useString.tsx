import React from 'react';
import { useClientSideBoundary } from './ClientSideBoundary';
import './useString.css';
import { mfmt } from './MessageFormat';
import { Narrow } from './narrow';

export type Vars = Record<string, string | number | boolean>;
export type S<V> = string & { _k: string; _v: V };

export function make<V = never>(key: string, value: string): S<V> {
  (value as any)._k = key;
  return value as any;
}

export type Meta = { collection?: 'string' | 'markdown' };

export type Getter<V, T> = (value: S<V>, vars: V) => T;

export type TxEl = NonNullable<React.ReactNode>;

type CmsLinkProps<A> = {
  value: S<A>;
  meta?: Meta;
  children: NonNullable<React.ReactNode>;
};

export type TxContext<A> = {
  value: S<A>;
  raw: Getter<A, string>;
  el: Getter<A, TxEl>;
  CmsLink: React.ComponentType<Omit<CmsLinkProps<A>, 'value'>>;
};

export function wrapStaticString(value: string): TxContext<never> {
  return {
    value: make('$', value),
    raw: () => value,
    el: () => value,
    CmsLink: () => <>{value}</>,
  };
}

function editOnCmsLink(props: CmsLinkProps<unknown>) {
  const slug = props.value._k;

  if (process.env.NODE_ENV === 'development') {
    return `/_cms/${slug}`;
  } else {
    const collection = props.meta?.collection ?? 'string';
    const host: string = process.env.CMS_HOST ?? '';
    return `${host}/cms/#/collections/${collection}/entries/${slug}`;
  }
}

function StringWithCmsLink(props: CmsLinkProps<unknown>) {
  const showCmsLinks = useCms();

  function editOnCms(e: React.MouseEvent) {
    e.preventDefault();
    window.open(editOnCmsLink(props), '_blank');
  }

  if (!showCmsLinks) {
    return <React.Fragment>{props.children}</React.Fragment>;
  }

  return (
    <span className="useString--container">
      <span onClick={editOnCms} className="useString--edit">
        edit
      </span>
      {props.children}
    </span>
  );
}

const CmsContext = React.createContext<boolean>(false);

export function CmsProvider(props: { children: React.ReactNode }) {
  const active = useClientSideBoundary({
    filter: () => {
      const url = new URL(window.location.href);
      const flag = url.searchParams.get('cms');
      return !!JSON.parse(flag ?? '0');
    },
  });
  return (
    <CmsContext.Provider value={active}>{props.children}</CmsContext.Provider>
  );
}

export function useCms(): boolean {
  return React.useContext(CmsContext);
}

export function useString() {
  type TxProps<V extends Vars> = { value: S<V>; vars?: Narrow<V> };

  function Tx<V extends Vars>(props: TxProps<V>) {
    const key = props.value._k;

    const isDev = process.env.NODE_ENV === 'development';
    const data = isDev ? { 'data-tx-key': key } : {};

    return (
      <StringWithCmsLink value={props.value}>
        <span
          {...data}
          dangerouslySetInnerHTML={{
            __html: raw(props.value, props.vars),
          }}
        />
      </StringWithCmsLink>
    );
  }

  function tx<V extends Vars>(value: S<V>, vars?: Narrow<V>) {
    return <Tx value={value} vars={vars} />;
  }

  function raw<V extends Vars>(value: S<V>, vars?: Narrow<V>) {
    return vars ? mfmt(value, vars) : value;
  }

  function ctx<V extends Vars>(value: S<V>, vars?: Narrow<V>): TxContext<V> {
    function CmsLink(props: Omit<CmsLinkProps<V>, 'value'>) {
      return <StringWithCmsLink value={value} {...props} />;
    }

    return {
      value,
      el: () => tx(value, vars),
      raw: () => raw(value, vars),
      CmsLink,
    };
  }

  return { tx, raw, ctx };
}
