import React, { Component, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createStore } from '@ice/store';
import models from './models';
// import {TodoStore} from './stores/todos';

// type CustomTodoStore = Store<TodoStore> & { subTitle: string };

// interface TodoListProps {
//   title: string;
//   store: CustomTodoStore;
// }

const { Provider, useModel, connect, useModelAction } = createStore(models);

class TodoList extends Component<any> {
  onRemove = (index) => {
    this.props.remove(index);
  }

  onToggle = (index) => {
    this.props.toggle(index);
  }

  render() {
    const { title, dataSource, subTitle, effects } = this.props;
    return (
      <div>
        <h2>{title}</h2>
        <p>
          Using Class Component, SubTitle is {subTitle}
        </p>
        <ul>
          {dataSource.map(({ name, done = false }, index) => (
            <li key={index}>
              <label>
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => this.onToggle(index)}
                />
                {done ? <s>{name}</s> : <span>{name}</span>}
              </label>
              {
                effects.remove.isLoading ?
                  'deleting...' :
                  <button type="submit" onClick={() => this.onRemove(index)}>-</button>
              }
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

const TodoListWithStore = connect(
  'todos',
  (state) => ({ ...state, subTitle: '测试的字段' }),
  (actions) => actions,
)(TodoList);

// Function Component
// function TodoListWithStore ({title}) {
//   const [todos, {toggle, remove, add}] = useModel('todos');
//   const { dataSource } = todos;

//   function onCheck(index) {
//     toggle(index);
//   }

//   function onRemove(index) {
//     remove(index);
//   }

//   useEffect(() => {
//     console.debug('TodoListWithStore:action - adddd...');
//     add({ name: 123 });
//   }, []);

//   console.debug('TodoList rending... dataSource:', dataSource);
//   return (
//     <div>
//       <h2>{title}</h2>
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
  const [ state, actions ] = useModel('todos');
  const { dataSource, effects } = state;
  const { refresh } = actions;

  useEffect(() => {
    refresh();
  }, []);

  const noTaskView = <span>no task</span>;
  const loadingView = <span>loading...</span>;
  const taskView = dataSource.length ? <TodoListWithStore title="标题" /> : noTaskView;

  console.debug('TodoApp rending... ');
  return (
    <div>
      <h2>Todos</h2>
      {!effects.refresh.isLoading ? taskView : loadingView}
    </div>
  );
}

function AddTodo() {
  const { add } = useModelAction('todos');

  console.debug('AddTodo rending...');
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
  const [ state, actions ] = useModel('user');
  const { dataSource, auth, todos } = state;
  const { login } = actions;
  const { name, age } = dataSource;

  useEffect(() => {
    login();
  }, []);

  console.debug('UserApp rending...');
  return auth ?
    (<div>
      <div>名称：{name}</div>
      <div>年龄：{age}</div>
      <div>持有任务：{todos}</div>
    </div>) :
    (<div>
      未登录
    </div>);
}

function App() {
  return (
    <Provider>
      <TodoApp />
      <AddTodo />
      <UserApp />
    </Provider>
  );
}

const rootElement = document.getElementById('ice-container');
ReactDOM.render(<App />, rootElement);
