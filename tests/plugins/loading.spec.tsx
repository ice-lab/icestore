import React from 'react';
import * as rhl from "@testing-library/react-hooks";
import * as rtl from "@testing-library/react";
import createLoadingPlugin from '../../src/plugins/loading';
import createStore from "../../src/index";
import counter from '../helpers/counter';
import Counter, { CounterUseEffectsLoading } from '../helpers/CounterClassComponent';

describe('createLoadingPlugin', () => {
  describe('validate config', () => {
    test('should not throw error when not passing config', () => {
      expect(() => createLoadingPlugin()).not.toThrow();
    });

    test('throw an error when the type of name is not string', () => {
      const config = { name: 1 } as any;
      expect(() => createLoadingPlugin(config)).toThrow(/loading plugin config name must be a string/);
    });

    test('throw an error when the type of asNumber is not boolean', () => {
      const config = { asNumber: 1 } as any;
      expect(() => createLoadingPlugin(config)).toThrow(/loading plugin config asNumber must be a boolean/);
    });

    test('throw an error when the whitelist is not an array', () => {
      const config = { whitelist: 'whitelist' } as any;
      expect(() => createLoadingPlugin(config)).toThrow(/loading plugin config whitelist must be an array of strings/);
    });

    test('throw an error when the blacklist is not an array', () => {
      const config = { blacklist: 'blacklist' } as any;
      expect(() => createLoadingPlugin(config)).toThrow(/loading plugin config blacklist must be an array of strings/);
    });

    test('throw an error when pass both the whitelist and the blacklist', () => {
      const config = { blacklist: [], whitelist: [] } as any;
      expect(() => createLoadingPlugin(config)).toThrow(/loading plugin config cannot have both a whitelist & a blacklist/);
    });
  });

  describe('loading state in function component', () => {
    test('normal', done => {
      const store = createStore({ counter });
      const { Provider, useModel, useModelEffectsLoading } = store;

      function useModelLoading(namespace) {
        const [state, dispatchers] = useModel(namespace);
        const effectsLoading = useModelEffectsLoading(namespace);

        return { state, dispatchers, effectsLoading };
      }

      const { result } = createHook(Provider, useModelLoading, "counter");
      const { dispatchers } = result.current;

      expect(result.current.effectsLoading.asyncDecrement).toBeFalsy();
      rhl.act(() => {
        dispatchers.asyncDecrement();
      });
      expect(result.current.effectsLoading.asyncDecrement).toBeTruthy();
      setTimeout(() => {
        expect(result.current.effectsLoading.asyncDecrement).toBeFalsy();
        done();
      }, 200);
    });


  });
  describe('loading state in class component', () => {
    const store = createStore({ counter });
    const { Provider, withModel, withModelEffectsLoading } = store;
    const WithModelCounter = withModel('counter')(Counter);
    const WithCounterUseEffectsState = withModelEffectsLoading('counter')(CounterUseEffectsLoading);

    test('normal', done => {
      const tester = rtl.render(
        <Provider>
          <WithCounterUseEffectsState>
            <WithModelCounter />
          </WithCounterUseEffectsState>
        </Provider>,
      );
      const { getByTestId } = tester;
      expect(getByTestId('asyncDecrementEffectsLoading').innerHTML).toBe('false');

      rtl.fireEvent.click(getByTestId('asyncDecrement'));
      expect(getByTestId('asyncDecrementEffectsLoading').innerHTML).toBe('true');

      setTimeout(() => {
        expect(getByTestId('asyncDecrementEffectsLoading').innerHTML).toBe('false');
        done();
      }, 200);
    });
  });
});

function createHook(Provider, callback, namespace) {
  return rhl.renderHook(() => callback(namespace), {
    wrapper: (props) => (
      <Provider {...props}>
        {props.children}
      </Provider>
    ),
  });
}
