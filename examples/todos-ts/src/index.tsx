import React, { Component, useEffect } from 'react';
import ReactDOM from 'react-dom';
import stores from './stores';

const {withStore} = stores;

@withStore('todos', (todos) => {
  const {remove, toggle, dataSource} = todos;
  return {remove, toggle, dataSource};
})
class TodoList extends Component<{remove: any; toggle: any; dataSource: any}> {
  onRemove = (index) => {
    const {remove} = this.props;
    remove(index);
  }

  onCheck = (index) => {
    const {toggle} = this.props;
    toggle(index);
  }

  render() {
    const {dataSource} = this.props;
    return (
      <ul>
        {dataSource.map(({ name, done = false }, index) => (
          <li key={index}>
            <label>
              <input
                type="checkbox"
                checked={done}
                onChange={() => this.onCheck(index)}
              />
              {done ? <s>{name}</s> : <span>{name}</span>}
            </label>
            <button type="submit" onClick={() => this.onRemove(index)}>-</button>
          </li>
        ))}
      </ul>
    );
  }
}

function Todo() {
  const todos = stores.useStore('todos');
  const { dataSource, refresh, add } = todos;

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onAdd(name) {
    const todo = await add({ name });
    console.log('Newly added todo is ', todo);
  }

  const noTaskView = <span>no task</span>;
  const loadingView = <span>loading...</span>;
  const taskView = dataSource.length ? <TodoList /> : (
    noTaskView
  );

  return (
    <div>
      <h2>Todos</h2>
      {!refresh.loading ? taskView : loadingView}
      <div>
        <input
          onKeyDown={(event) => {
            if (event.keyCode === 13) {
              onAdd(event.currentTarget.value);
              event.currentTarget.value = '';
            }
          }}
          placeholder="Press Enter"
        />
      </div>
    </div>
  );
}

const rootElement = document.getElementById('ice-container');
ReactDOM.render(<Todo />, rootElement);
