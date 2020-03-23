import React, { useEffect, useRef, useMemo } from 'react';

interface ExecutorProps {
  hook: () => any;
  onUpdate: (val: any) => void;
  namespace: string;
}

export default function(props: ExecutorProps) {
  const { hook, onUpdate, namespace } = props;

  const updateRef = useRef(onUpdate);
  updateRef.current = onUpdate;
  const initialLoad = useRef(false);

  let data: any;
  try {
    data = hook();
  } catch (e) {
    console.error(`Invoking '${namespace || 'unknown'}' model failed:`, e);
  }

  useMemo(() => {
    updateRef.current(data);
    initialLoad.current = false;
  }, []);

  useEffect(() => {
    if (initialLoad.current) {
      updateRef.current(data);
    } else {
      initialLoad.current = true;
    }
  });

  return null;
};
