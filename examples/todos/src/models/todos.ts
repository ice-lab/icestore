import { useState } from 'react';
import { useAsyncFn } from 'react-use';
import { delay } from '../utils';
import store from '../store';

export interface Todo {
  name: string;
  done?: boolean;
}

export default function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      name: 'Init',
      done: false,
    },
  ]);

  function getUserActions() {
    const [, actions] = store.getModel('user');
    return actions;
  }

  function toggle(index: number) {
    setTodos(prevState => {
      const dataSource = ([] as any).concat(prevState);
      dataSource[index].done = !prevState[index].done;
      return dataSource;
    });
  }

  function add(todo: Todo) {
    const dataSource = ([] as any).concat(todos);
    dataSource.push(todo);

    getUserActions().setTodos(dataSource.length);
    setTodos(dataSource);
  }

  const [refreshState, refresh] = useAsyncFn(async function() {
    await delay(2000);

    const dataSource = [
      {
        name: 'react',
      },
      {
        name: 'vue',
        done: true,
      },
      {
        name: 'angular',
      },
    ];
    getUserActions().setTodos(dataSource.length);
    setTodos(dataSource);
  }, [setTodos]);

  const [removeState, remove] = useAsyncFn(async function(index: number) {
    await delay(1000);
    const dataSource = ([] as any).concat(todos);
    dataSource.splice(index, 1);

    getUserActions().setTodos(dataSource.length);
    setTodos(dataSource);
  }, [todos, setTodos]);

  return [
    todos,
    {
      toggle,
      add,
      refresh,
      remove,
    },
    {
      refresh: refreshState,
      remove: removeState,
    },
  ];
};
