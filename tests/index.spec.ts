import createStore from "../src/index";
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
});
