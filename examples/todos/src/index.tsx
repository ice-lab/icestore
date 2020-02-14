import React, { Component, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createStore } from '@ice/store';
import models from './models';
// import {TodoStore} from './stores/todos';

// type CustomTodoStore = Store<TodoStore> & { customField: string };

// interface TodoListProps {
//   title: string;
//   store: CustomTodoStore;
// }

const store = createStore(models);

class TodoList extends Component<any> {
  onRemove = (index) => {
    const { remove } = this.props;
    remove(index);
  }

  onCheck = (index) => {
    const { toggle } = this.props;
    toggle(index);
  }

  render() {
    const {title, dataSource, customField, effects} = this.props;
    return (
      <div>
        <h2>class: {title}</h2>
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
              {
                effects.remove.isLoading ? ' 删除中...' : <button type="submit" onClick={() => this.onRemove(index)}>-</button>
              }
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

const TodoListWithStore = store.connect(
  'todos',
  (state) => ({ ...state, customField: '测试的字段' }),
  (actions) => actions,
)(TodoList);

// function TodoListWithStore ({title}) {
//   const [todos, {toggle, remove, add}] = store.useModel('todos');
//   const { dataSource } = todos;

//   function onCheck(index) {
//     toggle(index);
//   }

//   function onRemove(index) {
//     remove(index);
//   }

//   useEffect(() => {
//     console.log('TodoListWithStore:action - adddd...');
//     add({ name: 123 });
//   }, []);

//   console.log('TodoList rending... dataSource:', dataSource);
//   return (
//     <div>
//       <h2>function: {title}</h2>
//       <ul>
//         {dataSource.map(({ name, done = false }, index) => (
//           <li key={index}>
//             <label>
//               <input
//                 type="checkbox"
//                 checked={done}
//                 onChange={() => onCheck(index)}
//               />
//               {done ? <s>{name}</s> : <span>{name}</span>}
//             </label>
//             {
//               remove.loading ? ' 删除中...' : <button type="submit" onClick={() => onRemove(index)}>-</button>
//             }
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }

function TodoApp() {
  const [ state, actions ] = store.useModel('todos');
  const {dataSource, effects} = state;
  const {refresh} = actions;

  useEffect(() => {
    console.log('TodoApp:action - refresh...');
    refresh();
  }, []);

  const noTaskView = <span>no task</span>;
  const loadingView = <span>loading...</span>;
  const taskView = dataSource.length ? <TodoListWithStore title="标题" /> : noTaskView;

  console.log('TodoApp rending... ');
  return (
    <div>
      <h2>Todos</h2>
      {!effects.refresh.isLoading ? taskView : loadingView}
    </div>
  );
}

function AddTodo() {
  const { add } = store.useModelAction('todos');

  console.log('AddTodo rending...');
  return (
    <input
      onKeyDown={(event) => {
        if (event.keyCode === 13) {
          add({
            name: event.currentTarget.value,
          });
          event.currentTarget.value = '';
        }
      }}
      placeholder="Press Enter"
    />
  );
}

function UserApp() {
  const [{ dataSource, auth, todos }, {login}] = store.useModel('user');
  const { name, age } = dataSource;

  useEffect(() => {
    console.log('UserApp:action - login...');
    login();
  }, []);

  console.log('UserApp rending...');
  return (
    auth ? <div>
      <div>名称：{name}</div>
      <div>年龄：{age}</div>
      <div>持有任务：{todos || 0}</div>
    </div> : <div>
      未登录
    </div>
  );
}

function App() {
  return (
    <store.Provider>
      <TodoApp />
      <AddTodo />
      <UserApp />
    </store.Provider>
  );
}

const rootElement = document.getElementById('ice-container');
ReactDOM.render(<App />, rootElement);
