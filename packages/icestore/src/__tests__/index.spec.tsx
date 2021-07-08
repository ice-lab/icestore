import React from 'react';
import * as rtl from "@testing-library/react";
import createStore, { withModel } from "../index";
import counter from './helpers/counter';

describe("createStore", () => {
  test("creteStore should be defined", () => {
    expect(createStore).toBeDefined();
  });

  it("exposes the public API", () => {
    const store = createStore({ counter });
    const methods = Reflect.ownKeys(store);

    expect(methods).toContain("Provider");
    expect(methods).toContain("useModel");
    expect(methods).toContain("getModel");
    expect(methods).toContain("withModel");
    expect(methods).toContain("useModelDispatchers");
    expect(methods).toContain("withModelDispatchers");
    expect(methods).toContain("useModelEffectsState");
    expect(methods).toContain("withModelEffectsState");
    expect(methods).toContain("getModelState");
    expect(methods).toContain("getModelDispatchers");
  });

  it('exposes the withModel API', () => {
    function Counter({ model }) {
      const {
        useState,
        useValue,
        useDispatchers,
        useEffectsState,
        useEffectsError,
        useEffectsLoading,
        getValue,
        getState,
        getDispatchers,
        withValue,
        withDispatchers,
        withEffectsState,
        withEffectsError,
        withEffectsLoading,
      } = model;
      expect(useState).toBeDefined();
      expect(useValue).toBeDefined();
      expect(useDispatchers).toBeDefined();
      expect(useEffectsState).toBeDefined();
      expect(useEffectsError).toBeDefined();
      expect(useEffectsLoading).toBeDefined();
      expect(getValue).toBeDefined();
      expect(getState).toBeDefined();
      expect(getDispatchers).toBeDefined();
      expect(withValue).toBeDefined();
      expect(withDispatchers).toBeDefined();
      expect(withEffectsState).toBeDefined();
      expect(withEffectsError).toBeDefined();
      expect(withEffectsLoading).toBeDefined();
      return (
        <div />
      );
    };
    const WithModelCounter = withModel(counter)(Counter);

    rtl.render(
      <WithModelCounter />,
    );
  });
});
