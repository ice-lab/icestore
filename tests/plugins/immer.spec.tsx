import * as rhl from "@testing-library/react-hooks";
import createStore from '../../src/index';
import { counterWithImmer, counterWithNoImmer } from '../helpers/counter';
import createHook from '../helpers/createHook';

describe('createImmerPlugin', () => {
  const store = createStore({ counterWithNoImmer, counterWithImmer });
  const { Provider, useModel } = store;

  test('normal usage', () => {
    const { result } = createHook(Provider, useModel, "counterWithImmer");
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
    const { result } = createHook(Provider, useModel, "counterWithNoImmer");
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
