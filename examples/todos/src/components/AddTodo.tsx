import React from 'react';
import store from '../store';

const { useModelDispatchers } = store;

export default function() {
  const { add } = useModelDispatchers('todos');
  let input;

  return (
    <div>
      <form onSubmit={e => {
        e.preventDefault();
        if (!input.value.trim()) {
          return;
        }
        add({ text: input.value });
        input.value = '';
      }}>
        <input ref={node => input = node} />
        <button type="submit">
          Add Todo
        </button>
      </form>
    </div>
  );
}
