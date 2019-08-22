import Store from '../src/store';

describe('#Store', () => {
  test('new Class should be defined.', () => {
    expect(new Store('ab', {}, [])).toBeDefined();
  });

  describe('#Action', () => {
    const store: any = new Store('foo', {
      dataSource: [],
      async updateData() {
        this.dataSource = [1, 2, 3];
        return this.dataSource;
      },
      async fetchData() {
        throw new Error('bar');
      },
    }, []);
    test('action excutes ok.', async () => {
      const result = await store.bindings.updateData();
      expect(result).toEqual([1, 2, 3]);
    })
    test('action throws ok.', async () => {
      await expect(store.bindings.fetchData()).rejects.toThrow();
    })
  });
});
