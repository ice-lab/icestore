import React from 'react';
import store from '../store';

const { useModel } = store;

export default function UserApp() {
  const [ state ] = useModel('car');
  const { logo } = state;

  console.debug('Car rending...');
  return (
    <div>
      {logo}
    </div>
  );
}
