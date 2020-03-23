import { useState } from 'react';
import { useAsyncFn } from 'react-use';
import { delay } from '../utils';

export default function useUser() {
  const [user, setUser] = useState({
    dataSource: {
      name: '',
    },
    todos: 0,
    auth: false,
  });

  function setTodos(todos: number) {
    setUser(prevState => {
      return { ...prevState, todos };
    });
  }

  const [loginState, login] = useAsyncFn(async function() {
    await delay(1000);
    const dataSource = {
      name: 'Alvin',
    };
    const auth = true;

    setUser(prevState => {
      return { ...prevState, dataSource, auth };
    });
  });

  return [
    user,
    {
      setTodos,
      login,
    },
    {
      login: loginState,
    },
  ];
};
