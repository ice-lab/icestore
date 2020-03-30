import React from 'react';
import store from '../store';

const { useModel, useModelEffectsLoading } = store;

export function TodoList({ state, dispatchers, effectsLoading }) {
  const { title, subTitle, dataSource } = state;
  const { toggle, remove } = dispatchers;

  return (
    <div>
      <h2>{title}</h2>
      <p>
        Now is using {subTitle}.
      </p>
      <ul>
        {dataSource.map(({ name, done = false }, index) => (
          <li key={index}>
            <label>
              <input
                type="checkbox"
                checked={done}
                onChange={() => toggle(index)}
              />
              {done ? <s>{name}</s> : <span>{name}</span>}
            </label>
            {
              effectsLoading.remove ?
                '...deleting...' :
                <button type="submit" onClick={() => remove(index)}>-</button>
            }
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function({ title }) {
  const [ state, dispatchers ] = useModel('todos');
  const effectsLoading = useModelEffectsLoading('todos');
  return TodoList(
    {
      state: { ...state, title, subTitle: 'Function Component' },
      dispatchers,
      effectsLoading,
    },
  );
}
