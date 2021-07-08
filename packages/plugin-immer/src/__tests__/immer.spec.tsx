import * as rhl from '@testing-library/react-hooks';
import createStore from '@ice/store';
import createImmerPlugin from '../index';
import { counterWithImmer, counterWithNoImmer } from './helpers/counter';
import createHook from './helpers/createHook';

describe('immerPlugin', () => {
  test('normal usage xxxxx', () => {
    const store = createStore({ counterWithImmer }, {
      plugins: [createImmerPlugin()],
    });
    const { Provider, useModel } = store;
    const { result } = createHook(Provider, useModel, 'counterWithImmer');
    const baseState = result.current[0];
    rhl.act(() => {
      result.current[1].add();
    });
    const nextState = result.current[0];
    expect(baseState.a.b.c).toBe(0);
    expect(nextState.a.b.c).toBe(1);
    expect(nextState.d.b.c).toBe(0);
  });

  test('with no immer usage', () => {
    const store = createStore({ counterWithNoImmer },  {
      // plugins: [createImmerPlugin()],
    });
    const { Provider, useModel } = store;
    const { result } = createHook(Provider, useModel, 'counterWithNoImmer');
    const baseState = result.current[0];
    rhl.act(() => {
      result.current[1].add();
    });
    const nextState = result.current[0];
    expect(baseState.a.b.c).toBe(0);
    expect(nextState.a.b.c).toBe(1);
    expect(nextState.d.b.c).toBe(0);
  });
});
