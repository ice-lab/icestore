import React from 'react';
import store from '../store';

const { useModel, useModelActionsState } = store;

export function TodoList({ title, subTitle, dataSource }, { toggle, remove }, actionsState) {
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
              actionsState.remove.isLoading ?
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
  const [ state, actions ] = useModel('todos');
  const actionsState = useModelActionsState('todos');
  return TodoList(
    { ...state, title, subTitle: 'Function Component' },
    actions,
    actionsState,
  );
}
