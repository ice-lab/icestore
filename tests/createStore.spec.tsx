/* eslint-disable react/jsx-filename-extension */
import React, { PureComponent } from 'react';
import * as rtl from '@testing-library/react';
import * as rhl from '@testing-library/react-hooks';
import { createStore } from '../src/createStore';
import { UseModelValue, ModelActions } from '../src/types';
import counterModel from './helpers/counter';
import * as models from './helpers/models';

export const IceStoreContext = React.createContext(null);

describe('createStore', () => {
  it('exposes the public API', () => {
    const store = createStore(models);
    const methods = Reflect.ownKeys(store);

    expect(methods.length).toBe(9);
    expect(methods).toContain('Provider');
    expect(methods).toContain('useModel');
    expect(methods).toContain('useModelActions');
    expect(methods).toContain('useModelEffectsState');
    expect(methods).toContain('useModelActionsState');
    expect(methods).toContain('withModel');
    expect(methods).toContain('withModelActions');
    expect(methods).toContain('withModelEffectsState');
    expect(methods).toContain('withModelActionsState');
  });

  describe("Provider", () => {
    afterEach(() => rtl.cleanup());

    const store = createStore(models);
    const { Provider } = store;

    // function Child() {
    //   return (
    //     <IceStoreContext.Consumer>
    //       {(store) => {
    //         const text = '';
    //         console.log(store);
    //         if (store) {
    //           // const {} = 
    //           // text = store.getState().toString();
    //           console.log(store);
    //         }

    //         return (
    //           <div data-testid="todos">
    //             store - {text}
    //           </div>
    //         );
    //       }}
    //     </IceStoreContext.Consumer>
    //   );
    // }

    // const tester = rtl.render(
    //   <Provider>
    //     <Child />
    //   </Provider>,
    // );
  });

  describe('useModel', () => {
    afterEach(() => rhl.cleanup());

    const store = createStore(models);
    const { Provider, useModel, useModelEffectsState } = store;

    // it('throw when trying to use the inexisted model', () => {
    //   const namespace: any = 'test';
    //   expect(() => renderHook(() => useModel(namespace), {
    //     wrapper: props => (
    //       <Provider {...props}>
    //         {props.children}
    //       </Provider>
    //     ),
    //   })).toThrow();
    // });

    it('passes the initial state', () => {
      const initialStates = {
        todos: {
          title: 'Foo',
          done: true,
        },
      };
      const wrapper = props => <Provider {...props} initialStates={initialStates}>{props.children}</Provider>;
      const { result } = rhl.renderHook(() => useModel("todos"), { wrapper });
      const [state] = result.current;
      expect(state).toBe(initialStates.todos);
    });

    it('applies the reducer to the initial state', () => {
      const initialStates = {
        todos: {
          dataSource: [{
            title: 'Foo',
            done: true,
          }],
        },
      };
      const wrapper = props => <Provider {...props} initialStates={initialStates}>{props.children}</Provider>;
      const { result } = rhl.renderHook(() => useModel("todos"), { wrapper });
      const [state, actions] = result.current;
      const todos = models.todos;

      expect(state).toBe(initialStates.todos);
      expect(Reflect.ownKeys(actions)).toEqual([...Reflect.ownKeys(todos.reducers), ...Reflect.ownKeys(todos.effects)]);

      rhl.act(() => {
        actions.add({ name: 'testAction', done: false });
      });

      expect(result.current[0].dataSource).toEqual(
        [{
          title: 'Foo',
          done: true,
        }, {
          name: 'testAction',
          done: false,
        }],
      );
    });

    it('applies the reducer to the previous state', () => {
      const { result } = rhl.renderHook(() => useModel("todos"), {
        wrapper: props => (
          <Provider {...props}>
            {props.children}
          </Provider>
        ),
      });

      const [state, actions] = result.current;
      const todos = models.todos;

      expect(state).toBe(todos.state);
      expect(Reflect.ownKeys(actions)).toEqual([...Reflect.ownKeys(todos.reducers), ...Reflect.ownKeys(todos.effects)]);


      rhl.act(() => {
        actions.add({ name: 'testAction', done: false });
      });

      expect(result.current[0].dataSource).toEqual(
        [{
          name: 'Init',
          done: false,
        }, {
          name: 'testAction',
          done: false,
        }],
      );
    });

    it('get model effects state', async () => {
      const initialStates = {
        todos: {
          dataSource: [{
            title: 'Foo',
            done: true,
          }],
        },
      };
      const wrapper = props => <Provider {...props} initialStates={initialStates}>{props.children}</Provider>;

      // renderHook api doesn't support render one more hooks 
      // so we define a new hooks 
      function useModelEffect() {
        const [state, actions] = useModel("todos");
        const effectsState = useModelEffectsState('todos');

        return { state, actions, effectsState };
      }

      const { result, waitForNextUpdate } = rhl.renderHook(() => useModelEffect(), { wrapper });

      expect(result.current.state.dataSource).toEqual(initialStates.todos.dataSource);
      rhl.act(() => {
        result.current.actions.delete(0);
      });

      expect(result.current.effectsState.delete).toEqual({ isLoading: true, error: null });

      await waitForNextUpdate();

      expect(result.current.state.dataSource).toEqual([]);
      expect(result.current.effectsState.delete).toEqual({ isLoading: false, error: null });
    });
  });

  describe('withModel', () => {
    afterEach(() => rtl.cleanup());

    const store = createStore({ counter: counterModel });
    const { Provider, withModel, withModelActions, withModelEffectsState } = store;

    interface CounterProps {
      counter: UseModelValue<typeof counterModel>;
      children: React.ReactChild;
    }
    class Counter extends PureComponent<CounterProps> {
      render() {
        const { counter, children } = this.props;
        const [state, actions] = counter;
        const { count } = state;
        return (
          <React.Fragment>
            <div data-testid="count">{count}</div>
            <div data-testid="increment" onClick={() => actions.increment()} />
            <div data-testid="decrement" onClick={() => actions.decrement()} />
            <div data-testid="decrementAsync" onClick={() => actions.decrementAsync()} />
            {children}
          </React.Fragment>
        );
      }
    }

    interface CounterResetProps {
      counterActions: ModelActions<typeof counterModel>;
    };

    class CounterReset extends PureComponent<CounterResetProps> {
      render() {
        const { counterActions } = this.props;

        return (
          <div data-testid="reset" onClick={() => counterActions.reset()} />
        );
      }
    }

    interface CounterLoadingWrapperProps {
      counterEffectsState: any;
      children: React.ReactChild;
    }
    class CounterLoadingWrapper extends PureComponent<CounterLoadingWrapperProps> {
      render() {
        const { counterEffectsState, children } = this.props;
        return (
          <React.Fragment>
            <code data-testid="decrementAsyncState">
              {JSON.stringify(counterEffectsState.decrementAsync)}
            </code>
            {children}
          </React.Fragment>
        );
      }
    }

    // init withModel components
    const WithModelCounter = withModel('counter')(Counter);
    const WithActionsCounterReset = withModelActions('counter')(CounterReset);
    const WithEffectsStateCounterLoadingWrapper = withModelEffectsState('counter')(CounterLoadingWrapper);

    it('passes the initial state', () => {
      const initialStates = { counter: { count: 5 } };
      const tester = rtl.render(<Provider initialStates={initialStates}><WithModelCounter /></Provider>);
      const { getByTestId } = tester;
      expect(getByTestId('count').innerHTML).toBe('5');
    });

    it('applies the reducer to the initial state', () => {
      const initialStates = { counter: { count: 5 } };
      const tester = rtl.render(<Provider initialStates={initialStates}><WithModelCounter /></Provider>);
      const { getByTestId } = tester;
      expect(getByTestId('count').innerHTML).toBe('5');

      rtl.fireEvent.click(getByTestId('increment'));
      expect(getByTestId('count').innerHTML).toBe('6');

      rtl.fireEvent.click(getByTestId('decrement'));
      expect(getByTestId('count').innerHTML).toBe('5');
    });

    it('applies the reducer to the previous state', () => {
      const tester = rtl.render(<Provider><WithModelCounter /></Provider>);
      const { getByTestId } = tester;
      expect(getByTestId('count').innerHTML).toBe('0');

      rtl.fireEvent.click(getByTestId('increment'));
      expect(getByTestId('count').innerHTML).toBe('1');

      rtl.fireEvent.click(getByTestId('decrement'));
      expect(getByTestId('count').innerHTML).toBe('0');
    });

    it('WithModelActions', () => {
      const tester = rtl.render(
        <Provider>
          <WithModelCounter>
            <WithActionsCounterReset />
          </WithModelCounter>
        </Provider>,
      );
      const { getByTestId } = tester;
      expect(getByTestId('count').innerHTML).toBe('0');

      rtl.fireEvent.click(getByTestId('increment'));
      expect(getByTestId('count').innerHTML).toBe('1');

      rtl.fireEvent.click(getByTestId('reset'));
      expect(getByTestId('count').innerHTML).toBe('0');
    });

    it('withModelEffectsState', async () => {
      const container = (
        <Provider>
          <WithEffectsStateCounterLoadingWrapper>
            <WithModelCounter />
          </WithEffectsStateCounterLoadingWrapper>
        </Provider>
      );
      const tester = rtl.render(container);

      const { getByTestId } = tester;
      expect(getByTestId('count').innerHTML).toBe('0');
      rtl.fireEvent.click(getByTestId('decrementAsync'));

      expect(getByTestId('decrementAsyncState').innerHTML).toBe('{"isLoading":true,"error":null}');

      // await rtl.wait(() => tester.getByTestId('decrementAsyncState'));
      await rtl.waitForDomChange();
      expect(getByTestId('decrementAsyncState').innerHTML).toBe('{"isLoading":false,"error":null}');
    });
  });
});
