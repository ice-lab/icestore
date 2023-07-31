import React, { useEffect } from 'react';
import store from '../store';
import Todo from './Todo';
import { VisibilityFilters } from '../models/visibilityFilter';

const { useModel, useModelEffectsLoading } = store;

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case VisibilityFilters.ALL:
      return todos;
    case VisibilityFilters.COMPLETED:
      return todos.filter(t => t.completed);
    case VisibilityFilters.ACTIVE:
      return todos.filter(t => !t.completed);
    default:
      throw new Error(`Unknown filter: ${filter}`);
  }
};

export default function TodoList() {
  const [todos, dispatchers] = useModel('todos');
  const [visibilityFilter] = useModel('visibilityFilter');
  const effectsLoading = useModelEffectsLoading('todos');

  const { refresh, asyncRemove, remove, toggle } = dispatchers;
  const visableTodos = getVisibleTodos(todos, visibilityFilter);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line
  }, []);

  const noTaskView = <div>No task</div>;
  const loadingView = <div>Loading...</div>;
  const taskView = visableTodos.length ? (
    <ul>
      {visableTodos.map(({ text, completed }, index) => (
        <Todo
          key={index}
          text={text}
          completed={completed}
          onAsyncRemove={() => asyncRemove(index)}
          onRemove={() => remove(index)}
          onToggle={() => toggle(index)}
          isLoading={effectsLoading.asyncRemove}
        />
      ))}
    </ul>
  ) : noTaskView;

  return effectsLoading.refresh ? loadingView : taskView;
}
