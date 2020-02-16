import React from 'react';
import store from '../store';

const { useModelActions } = store;

export default function TodoAdd() {
  const { add } = useModelActions('todos');

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
