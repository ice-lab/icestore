import React from 'react';
import store from '../store';

const { useModelDispatchers } = store;

export default function TodoAdd() {
  const { add } = useModelDispatchers('todos');

  console.debug('TodoAdd rending...');
  return (
    <input
      onKeyDown={(event) => {
        if (event.keyCode === 13) {
          add({
            name: event.currentTarget.value,
          });
          event.currentTarget.value = '';
        }
      }}
      placeholder="Press Enter"
    />
  );
}
