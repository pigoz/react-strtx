import React from 'react';

type Props = {
  children: React.ReactNode | React.ReactNode[];
};

export function useClientSideBoundary(options: { filter?: () => boolean }) {
  const [clientSide, setClientSide] = React.useState<boolean>(false);
  const ssr = typeof window === 'undefined';

  React.useEffect(() => {
    if (ssr) {
      return;
    }

    setClientSide(options.filter ? options.filter() : true);
  }, []);

  return clientSide;
}

export function ClientSideBoundary(props: Props) {
  const isClientSide = useClientSideBoundary({});

  if (!isClientSide) {
    return null;
  }

  return <React.Fragment>{props.children}</React.Fragment>;
}
