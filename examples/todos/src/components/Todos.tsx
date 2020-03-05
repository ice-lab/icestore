import React, { useEffect } from 'react';
import store from '../store';
// import TodoList from './TodoListClass';
import TodoList from './TodoList';

const { useModel, useModelEffectsState } = store;

export default function Todos() {
  const todos = useModel('todos');
  const [ state, actions ] = todos;
  const effectsState = useModelEffectsState('todos');
  const { dataSource } = state;
  const { refresh } = actions;

  useEffect(() => {
    refresh();
  }, []);

  const noTaskView = <div>no task</div>;
  const loadingView = <div>loading...</div>;
  const taskView = dataSource.length ? <TodoList title="Todos" /> : noTaskView;

  console.debug('Todos rending... ');
  return effectsState.refresh.isLoading? loadingView : taskView;
}
