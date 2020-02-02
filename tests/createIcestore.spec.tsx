import * as React from 'react';
import { render, fireEvent, getByTestId, wait } from '@testing-library/react';
import createIcestore, { shallowEqual } from '../src/index';

describe('#Icestore', () => {
  describe('#createIcestore', () => {
    let useStore;
    let useStores;
    let getState;
    let withStore;
    let withStores;
    let todoStore;
    let projectStore;

    beforeEach(() => {
      todoStore = {
        name: 'ice',
      };
      projectStore = {
        name: 'rax',
      };
      const icestore = createIcestore({
        todo: todoStore,
        project: projectStore,
      });
      useStore = icestore.useStore;
      useStores = icestore.useStores;
      getState = icestore.getState;
      withStore = icestore.withStore;
      withStores = icestore.withStores;
    });

    test('should throw an Error when the namespace is not exist.', () => {
      expect(() => useStore('test')).toThrowError('Not found namespace: test');
    });

    test('should useStore be ok.', () => {
      const App = () => {
        const todo = useStore('todo');

        return <div>
          <span data-testid="todoName">{todo.name}</span>
        </div>;
      };

      const { container } = render(<App />);
      const todoName = getByTestId(container, 'todoName');

      expect(todoName.textContent).toEqual(todoStore.name);
    });

    test('should useStores be ok.', () => {
      const App = () => {
        const {todo, project} = useStores(['todo', 'project']);

        return <div>
          <span data-testid="todoName">{todo.name}</span>
          <span data-testid="projectName">{project.name}</span>
        </div>;
      };

      const { container } = render(<App />);
      const todoName = getByTestId(container, 'todoName');
      const projectName = getByTestId(container, 'projectName');

      expect(todoName.textContent).toEqual(todoStore.name);
      expect(projectName.textContent).toEqual(projectStore.name);
    });

    test('should getState be ok.', () => {
      const App = () => {
        const todo = getState('todo');

        return <div>
          <span data-testid="todoName">{todo.name}</span>
        </div>;
      };

      const { container } = render(<App />);
      const todoName = getByTestId(container, 'todoName');

      expect(todoName.textContent).toEqual(todoStore.name);
    });

    test('should withStore be ok.', () => {
      interface PropsType {
        todo?: any;
      }
      @withStore('todo', (todo) => {
        return {todo};
      })
      class App extends React.Component<PropsType> {
        render() {
          const {todo} = this.props;
          return <div>
            <span data-testid="todoName">{todo.name}</span>
          </div>;
        }
      }
      const { container } = render(<App />);
      const todoName = getByTestId(container, 'todoName');

      expect(todoName.textContent).toEqual(todoStore.name);
    });

    test('should withStores be ok.', () => {
      interface PropsType {
        todo?: any;
        project?: any;
      }
      @withStores(['todo', 'project'], ({todo, project}) => {
        return {todo, project};
      })
      class App extends React.Component<PropsType> {
        render() {
          const {todo, project} = this.props;
          return <div>
            <span data-testid="todoName">{todo.name}</span>
            <span data-testid="projectName">{project.name}</span>
          </div>;
        }
      }
      const { container } = render(<App />);
      const todoName = getByTestId(container, 'todoName');
      const projectName = getByTestId(container, 'projectName');

      expect(todoName.textContent).toEqual(todoStore.name);
      expect(projectName.textContent).toEqual(projectStore.name);
    });
  });

  describe('#getState', () => {
    test('should get state from store success.', () => {
      const icestore = createIcestore({foo: { data: 'abc', fetchData: () => {} }});
      expect(icestore.getState('foo')).toEqual({ data: 'abc' });
    });
  });

  describe('#getStore', () => {
    test('should get store success.', () => {
      const icestore = createIcestore({foo: { data: 'abc', fetchData: () => {} }});
      expect(icestore.getStore('foo').data).toEqual('abc');
    });
  });

  describe('#useStore', () => {
    test('should throw an Error when the namespace is not exist.', () => {
      const icestore = createIcestore({
        todo: { foo: 123 },
      });
      expect(() => icestore.useStore('test')).toThrowError('Not found namespace: test');
    });

    test('should useStore be ok.', async () => {
      const initState = {
        name: 'ice',
      };
      const newState = {
        name: 'rax',
      };
      const icestore = createIcestore({todo:  {
        dataSource: initState,
        setData(dataSource) {
          this.dataSource = dataSource;
        },
      }});

      const renderFn = jest.fn();

      const Todos = () => {
        const todo: any = icestore.useStore('todo');
        const { dataSource } = todo;

        renderFn();

        function handleClick() {
          todo.setData(newState);
        }

        return <div>
          <span data-testid="nameValue">{dataSource.name}</span>
          <button type="button" data-testid="actionButton" onClick={handleClick}>
          Click me
          </button>
        </div>;
      };

      const { container } = render(<Todos />);
      const nameValue = getByTestId(container, 'nameValue');
      const actionButton = getByTestId(container, 'actionButton');

      expect(nameValue.textContent).toEqual(initState.name);
      expect(renderFn).toHaveBeenCalledTimes(1);

      fireEvent.click(actionButton);

      await wait(() => {
        expect(renderFn).toHaveBeenCalledTimes(2);
        expect(nameValue.textContent).toEqual(newState.name);
      });

    });

    test('should useStores be ok.', () => {
      const todoStore = { name: 'ice' };
      const projectStore = { name: 'rax' };
      const icestore = createIcestore({ todo: todoStore, project: projectStore });

      const App = () => {
        const {todo, project} = icestore.useStores(['todo', 'project']);

        return <div>
          <span data-testid="todoName">{todo.name}</span>
          <span data-testid="projectName">{project.name}</span>
        </div>;
      };

      const { container } = render(<App />);
      const todoName = getByTestId(container, 'todoName');
      const projectName = getByTestId(container, 'projectName');

      expect(todoName.textContent).toEqual(todoStore.name);
      expect(projectName.textContent).toEqual(projectStore.name);
    });

    test('should equalityFn be ok.', async () => {
      const initState = {
        name: 'ice',
      };
      const { useStore } = createIcestore({
        'todo': {
          dataSource: initState,
          setData(dataSource) {
            this.dataSource = dataSource;
          },
        },
      });

      let renderCount = 0;
      const renderFn = () => renderCount++;

      const Todos = ({ equalityFn }) => {
        const todo: any = useStore('todo', equalityFn);
        const { dataSource } = todo;

        renderFn();

        const changeNothing = () => todo.setData(initState);
        const changeStateRef = () => todo.setData({ ...initState });

        return <div>
          <span data-testid="nameValue">{dataSource.name}</span>
          <button type="button" data-testid="changeNothingBtn" onClick={changeNothing}>
            Click me
          </button>
          <button type="button" data-testid="changeStateRefBtn" onClick={changeStateRef}>
            Click me
          </button>
        </div>;
      };

      const { container, unmount } = render(<Todos equalityFn={shallowEqual} />);
      const nameValue = getByTestId(container, 'nameValue');
      const changeNothingBtn = getByTestId(container, 'changeNothingBtn');
      const changeStateRefBtn = getByTestId(container, 'changeStateRefBtn');

      expect(nameValue.textContent).toEqual(initState.name);
      expect(renderCount).toBe(1);

      fireEvent.click(changeNothingBtn);

      // will not rerender
      await wait(() => {
        expect(nameValue.textContent).toEqual(initState.name);
        expect(renderCount).toBe(1);
      });

      fireEvent.click(changeStateRefBtn);

      // will rerender
      await wait(() => {
        expect(nameValue.textContent).toEqual(initState.name);
        expect(renderCount).toBe(2);
      });

      unmount();

      const { container: container1 } = render(<Todos equalityFn={(a, b) => a.dataSource.name === b.dataSource.name} />);
      const nameValue1 = getByTestId(container1, 'nameValue');
      const changeStateRefBtn1 = getByTestId(container1, 'changeStateRefBtn');

      expect(nameValue1.textContent).toEqual(initState.name);
      expect(renderCount).toBe(3);

      fireEvent.click(changeStateRefBtn1);

      // will not rerender
      await wait(() => {
        expect(nameValue1.textContent).toEqual(initState.name);
        expect(renderCount).toBe(3);
      });
    });
  });
});
