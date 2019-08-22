import * as React from 'react';
import { render, fireEvent, getByTestId } from 'react-testing-library';
import Icestore from '../src/index';
import Store from '../src/store';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('#Icestore', () => {
  test('new Class should be defined.', () => {
    expect(new Icestore()).toBeDefined();
  });

  describe('#registerStore', () => {
    let icestore;

    beforeEach(() => {
      icestore = new Icestore();
    });

    test('should return a Store.', () => {
      const store = icestore.registerStore('test', {
        name: 'ice',
      });
      expect(store instanceof Store).toBe(true);
    });

    test('should throw an Error when the same namespace is registered.', () => {
      icestore.registerStore('test', {});
      expect(() => icestore.registerStore('test', {})).toThrowError('Namespace have been used: test');
    });
  });

  describe('#applyMiddleware', () => {
    let icestore;
    const testMiddleware = async (ctx, next) => {
      return next();
    };

    beforeEach(() => {
      icestore = new Icestore();
      icestore.registerStore('foo', { data: 'abc', fetchData: () => {} });
    });

    test('should apply to global success.', () => {
      icestore.applyMiddleware([testMiddleware]);
      expect(icestore.globalMiddlewares).toEqual([testMiddleware]);
    });
    test('should apply to single store success.', () => {
      icestore.applyMiddleware([testMiddleware], 'foo');
      expect(icestore.middlewareMap.foo).toEqual([testMiddleware]);
    });
  });

  describe('#getState', () => {
    let icestore;
    const testMiddleware = async (ctx, next) => {
      return next();
    };

    beforeEach(() => {
      icestore = new Icestore();
      icestore.registerStore('foo', { data: 'abc', fetchData: () => {} });
    });

    test('should get state from store success.', () => {
      expect(icestore.getState('foo')).toEqual({ data: 'abc' });
    });
  });

  describe('#useStore', () => {
    let icestore;

    beforeEach(() => {
      icestore = new Icestore();
    });

    afterEach(() => {
      icestore = null;
    });

    test('should throw an Error when the namespace is not exist.', () => {
      expect(() => icestore.useStore('test')).toThrowError('Not found namespace: test');
    });

    test('should useStore be ok.', async () => {
      const initState = {
        name: 'ice',
      };
      const newState = {
        name: 'rax',
      };
      icestore.registerStore('todo', {
        dataSource: initState,
        setData(dataSource) {
          this.dataSource = dataSource;
        },
      });

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

      await sleep(10);

      expect(renderFn).toHaveBeenCalledTimes(2);
      expect(nameValue.textContent).toEqual(newState.name);
    });

    test('should useStores be ok.', () => {
      const todoStore = { name: 'ice' };
      const projectStore = { name: 'rax' };
      icestore.registerStore('todo', todoStore);
      icestore.registerStore('project', projectStore);

      const App = () => {
        const [todo, project] = icestore.useStores(['todo', 'project']);

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
  });
});
