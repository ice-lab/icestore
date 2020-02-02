import { Wrapper, compose } from '../src/wrapper';

describe('#Wrapper', () => {
  test('new Class should be defined.', () => {
    expect(new Wrapper('ab', {}, [])).toBeDefined();
  });

  describe('#Action', () => {
    const wrapper: any = new Wrapper('foo', {
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
      const result = await wrapper.store.updateData();
      expect(result).toEqual([1, 2, 3]);
    });
    test('action throws ok.', async () => {
      await expect(wrapper.store.fetchData()).rejects.toThrow();
    });
  });

  describe('#compose', () => {
    const arr = [];
    const middlewares = [];

    function wait (ms) {
      return new Promise((resolve) => setTimeout(resolve, ms || 1));
    }
    test('should work', async () => {
      middlewares.push(async (ctx, next) => {
        arr.push(1);
        await wait(1);
        await next();
        await wait(1);
        arr.push(6);
      });
      middlewares.push(async (ctx, next) => {
        arr.push(2);
        await wait(1);
        await next();
        await wait(1);
        arr.push(5);
      });
      middlewares.push(async (ctx, next) => {
        arr.push(3);
        await wait(1);
        await next();
        await wait(1);
        arr.push(4);
      });

      const ctx = {
        action: {
          name: '',
          arguments: [],
        },
        store: {
          namespace: 'foo',
          getState: () => { return {}; },
        },
      };
      await compose(middlewares, ctx)();
      expect(arr).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });
});
