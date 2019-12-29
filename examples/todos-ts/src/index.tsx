import React, { Component, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {Store} from '@ice/store';
import stores from './stores';
import {TodoStore} from './stores/todos';

const {withStore} = stores;

type CustomTodoStore = Store<TodoStore> & { customField: string };

interface TodoListProps {
  title: string;
  store: CustomTodoStore;
}

class TodoList extends Component<TodoListProps> {
  onRemove = (index) => {
    const {remove} = this.props.store;
    remove(index);
  }

  onCheck = (index) => {
    const {toggle} = this.props.store;
    toggle(index);
  }

  render() {
    const {title, store} = this.props;
    const {dataSource, customField} = store;
    return (
      <div>
        <h2>{title}</h2>
        <p>
          {customField}
        </p>
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
      </div>
    );
  }
}

const TodoListWithStore = withStore('todos', (store: TodoStore): {store: CustomTodoStore} => {
  return { store: {...store, customField: '测试的字段'} };
})(TodoList);

function TodoApp() {
  const todos = stores.useStore('todos');
  const { dataSource, refresh, add } = todos;

  useEffect(() => {
    refresh();
  }, []);

  async function onAdd(name) {
    const todo = await add({ name });
    console.log('Newly added todo is ', todo);
  }

  const noTaskView = <span>no task</span>;
  const loadingView = <span>loading...</span>;
  const taskView = dataSource.length ? <TodoListWithStore title="标题" /> : (
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
ReactDOM.render(<TodoApp />, rootElement);
