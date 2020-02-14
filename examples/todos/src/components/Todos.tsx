import React, { useEffect } from 'react';
import store from '../store';
import TodoList from './TodoList';

const { useModel, useModelEffectState } = store;

export default function Todos() {
  const [ state, actions ] = useModel('todos');
  const effectState = useModelEffectState('todos');
  const { dataSource } = state;
  const { refresh } = actions;

  useEffect(() => {
    refresh();
  }, []);

  const noTaskView = <div>no task</div>;
  const loadingView = <div>loading...</div>;
  const taskView = dataSource.length ? <TodoList title="Todos" /> : noTaskView;

  console.debug('Todos rending... ');
  return effectState.refresh.isLoading? loadingView : taskView;
}
