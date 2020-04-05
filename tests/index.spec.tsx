/* eslint-disable react/jsx-filename-extension */
import React from "react";
import * as rhl from "@testing-library/react-hooks";
import * as rtl from "@testing-library/react";
import { createStore } from "../src/index";
import * as models from "./helpers/models";
import { todosWithUnsupportEffects } from "./helpers/todos";

describe("createStore", () => {
  test("creteStore should be defined", () => {
    expect(createStore).toBeDefined();
  });

  it("exposes the public API", () => {
    const store = createStore(models);
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

  it("create unsupported effects should console error", () => {
    const spy = jest.spyOn(console, "error");
    createStore({ todosWithUnsupportEffects });
    expect(spy).toHaveBeenCalled();
  });

  describe("Provider", () => {
    afterEach(() => rtl.cleanup());
    const store = createStore(models);
    const { Provider } = store;

    it("should not enforce one child", () => {
      expect(() =>
        rtl.render(
          <Provider>
            <div />
          </Provider>,
        ),
      ).not.toThrow();

      expect(() =>
        rtl.render(
          <Provider>
            <div />
            <div />
          </Provider>,
        ),
      ).not.toThrow();
    });
  });

  describe("useModel", () => {
    afterEach(() => rhl.cleanup());

    const store = createStore(models);
    const { Provider, useModel } = store;

    it("throw error when trying to use the inexisted model", () => {
      const namespace: any = "test";
      const { result } = rhl.renderHook(() => useModel(namespace), {
        wrapper: (props) => <Provider {...props}>{props.children}</Provider>,
      });
      // expect(result.error).toEqual(
      //   Error(`Not found model by namespace: ${namespace}.`)
      // );
    });

    it("passes the initial state", () => {
      const initialState = {
        todos: { title: "Foo", done: true },
        user: { name: "test" },
      };
      const wrapper = (props) => (
        <Provider {...props} initialState={initialState}>
          {props.children}
        </Provider>
      );
      const { result: todosResult } = rhl.renderHook(() => useModel("todos"), {
        wrapper,
      });
      const { result: userResult } = rhl.renderHook(() => useModel("user"), {
        wrapper,
      });
      const [todosState] = todosResult.current;
      const [userState] = userResult.current;
      expect(todosState).toBe(initialState.todos);
      expect(userState).toBe(initialState.user);
    });
  });

  describe("withModel", () => { });

  describe("getModel", () => { });

  describe("useModelDispatchers", () => { });

  describe("useModelEffectsState", () => { });

  describe("withModelDispatchers", () => { });

  describe("withModelEffectsState", () => { });

  describe("getModelState", () => { });

  describe("getModelDispatchers", () => { });

  describe("disable immer", () => {
    const store = createStore(models, {
      disableImmer: true,
    });
  });

  describe("disable loading", () => {
    const store = createStore(models, {
      disableLoading: true,
    });
    const methods = Reflect.ownKeys(store);

    expect(methods).not.toContain("useModelEffectsLoading");
    expect(methods).not.toContain("withModelEffectsLoading");
  });

  describe("disable error", () => {
    const store = createStore(models, {
      disableError: true,
    });

    const methods = Reflect.ownKeys(store);

    expect(methods).not.toContain("useModelEffectsError");
    expect(methods).not.toContain("withModelEffectsError");
  });
});
