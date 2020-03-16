import React from 'react';
import * as rhl from '@testing-library/react-hooks';
import { createUseContainer, createContainer } from '../src/createContainer';
import counter from './helpers/counter';

jest.mock('../src/createModel');
// eslint-disable-next-line import/first
import { createModel } from '../src/createModel';

const NO_PROVIDER = '_NP_' as any;

describe('createUseContainer', () => {
  it('throws if component is not wrapped in provider', () => {
    const Context = React.createContext(NO_PROVIDER);

    const useContainer = createUseContainer(Context);

    const { result } = rhl.renderHook(() => useContainer());

    expect(result.error.message).toMatch('Component must be wrapped within a Provider.');
  });
});

describe('createContainer', () => {
  const [useValue] = createModel(counter);

  it('does not pass splitValues', () => {
    const result = createContainer(useValue);
    expect(result.length).toBe(2);
    const [Provider, contextFunc] = result;

    expect(Provider.displayName).toBe('useValue.Provider');
    expect(Provider.name).toBe('Provider');

    const wrapper = props => (
      <Provider {...props}>
        {props.children}
      </Provider>
    );
    const { result: contextValueResult } = rhl.renderHook(() => contextFunc(), { wrapper });
    const current = contextValueResult.current;

    expect(current[0]).toEqual({ count: 0 });
    expect(Reflect.ownKeys(current[1]).length).toBe(4);
  });

  it('passes splitValues', () => {
    const result = createContainer(
      useValue,
      value => value[0],
      value => value[1],
      value => value[2],
    );

    expect(result.length).toBe(4);
    expect(result[0].name).toBe('SplitProvider');
    const [Provider, useStateFunc, useActionsFunc, useEffectsStateFunc] = result;

    function useCounterModel() {
      const state = useStateFunc();
      const actions = useActionsFunc();
      const effectsState = useEffectsStateFunc();

      return { state, actions, effectsState };
    }

    const wrapper = props => (
      <Provider {...props}>
        {props.children}
      </Provider>
    );
    const { result: contextValueResult } = rhl.renderHook(() => useCounterModel(), { wrapper });
    const current = contextValueResult.current;
    const { state, actions, effectsState } = current;

    expect(state).toEqual({ count: 0 });
    expect(Reflect.ownKeys(actions).length).toBe(4);
    expect(Reflect.ownKeys(effectsState).length).toBe(1);
  });
});
