import React, { useEffect } from 'react';
import store from '../store';

const { useModel } = store;

export default function UserApp() {
  const [state, dispatchers] = useModel('user');
  const { dataSource, auth, todos } = state;
  const { login } = dispatchers;
  const { name } = dataSource;

  useEffect(() => {
    login();
    // eslint-disable-next-line
  }, []);

  console.debug('UserApp rending...');
  return <div>
    <hr/>
    {
      auth ?
      <div>
        <h2>
          User Information
        </h2>
        <ul>
          <li>Name：{name}</li>
          <li>Todos：{todos}</li>
        </ul>
      </div> :
      <div>
        Not logged in
      </div>
    }
  </div>;
}
