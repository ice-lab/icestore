/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import { createStore } from '../src/createStore';
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
    afterEach(() => cleanup());

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
      const { result } = renderHook(() => useModel("todos"), { wrapper });
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
      const { result } = renderHook(() => useModel("todos"), { wrapper });
      const [state, actions] = result.current;
      const todos = models.todos;

      expect(state).toBe(initialStates.todos);
      expect(Reflect.ownKeys(actions)).toEqual([...Reflect.ownKeys(todos.reducers), ...Reflect.ownKeys(todos.effects)]);

      act(() => {
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
      const { result } = renderHook(() => useModel("todos"), {
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


      act(() => {
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

      const { result, waitForNextUpdate } = renderHook(() => useModelEffect(), { wrapper });

      expect(result.current.state.dataSource).toEqual(initialStates.todos.dataSource);
      act(() => {
        result.current.actions.delete(0);
      });

      expect(result.current.effectsState.delete).toEqual({ isLoading: true, error: null });

      await waitForNextUpdate();

      expect(result.current.state.dataSource).toEqual([]);
      expect(result.current.effectsState.delete).toEqual({ isLoading: false, error: null });
    });
  });
});
