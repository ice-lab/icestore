import React, { useEffect } from 'react';
import store from '../store';
// import TodoList from './TodoListClass';
import TodoList from './TodoList';

const { useModel, useModelEffectsLoading } = store;

export default function Todos() {
  const todos = useModel('todos');
  const [ state, dispatchers ] = todos;
  const effectsLoading = useModelEffectsLoading('todos');

  const { dataSource } = state;
  const { refresh } = dispatchers;

  useEffect(() => {
    refresh();
  }, [refresh]);

  const noTaskView = <div>no task</div>;
  const loadingView = <div>loading...</div>;
  const taskView = dataSource.length ? <TodoList title="Todos" /> : noTaskView;

  console.debug('Todos rending... ');
  return effectsLoading.refresh ? loadingView : taskView;
}
