import React, { useEffect } from 'react';
import store from '../store';
import Todo from './Todo';
const { useModel, useModelEffectsLoading } = store;

export default function TodoList() {
  const todos = useModel('todos');
  const effectsLoading = useModelEffectsLoading('todos');
  const [ state, dispatchers ] = todos;
  const { refresh, removeAsync, toggle } = dispatchers;

  useEffect(() => {
    refresh();
    // eslint-disable-next-line
  }, []);

  const noTaskView = <div>No task</div>;
  const loadingView = <div>Loading...</div>;
  const taskView = state.length ? (
    <ul>
      {state.map(({ text, completed }, index) => (
        <Todo
          key={index}
          text={text}
          completed={completed}
          onRemove={() => removeAsync(index)}
          onToggle={() => toggle(index)}
          isLoading={effectsLoading.removeAsync}
        />
      ))}
    </ul>
  ) : noTaskView;

  return effectsLoading.refresh ? loadingView : taskView;
}
