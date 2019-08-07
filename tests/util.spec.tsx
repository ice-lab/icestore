import { addProxy, toJS, compose } from '../src/util';

describe('#util', () => {
  let handler;

  beforeEach(() => {
    handler = {
      set: (target, prop): boolean => {
        /* eslint no-param-reassign: 0 */
        target[prop] = 'foo';
        return true;
      },
    };
  });

  describe('#addProxy', () => {
    test('should null type not affected', () => {
      const value = null;
      expect(addProxy(value, handler)).toBe(value);
    });

    test('should frozen object not affected', () => {
      const value = Object.freeze({
        a: 1,
        b: 2,
      });
      expect(addProxy(value, handler)).toBe(value);
    });

    test('should function proxy set success', () => {
      const value = () => {};
      const result: any = addProxy(value, handler);
      result.loading = true;
      expect(result.loading).toBe('foo');
    });

    test('should object proxy set success', () => {
      const value = {
        a: 1,
        b: 2,
      };
      const result: any = addProxy(value, handler);
      result.a = 100;
      expect(result.a).toBe('foo');
    });

    test('should object proxy recursively set success', () => {
      const value = {
        a: [
          { c: 3 },
        ],
        b: 2,
      };
      const result: any = addProxy(value, handler);
      result.a[0].c = 4;
      expect(result.a[0].c).toBe('foo');
    });

    test('should array proxy set success', () => {
      const value = [1, 2];
      const result: any = addProxy(value, handler);
      result[0] = 4;
      expect(result[0]).toBe('foo');
    });

    test('should array proxy recursively set success', () => {
      const value = [
        { a: 1 },
      ];
      const result: any = addProxy(value, handler);
      result[0].a = 4;
      expect(result[0].a).toBe('foo');
    });
  });


  describe('#toJS', () => {
    test('should null type convert success', () => {
      const value = null;
      const jsValue = toJS(value);
      expect(jsValue).toBe(value);
    });

    test('should non object type convert success', () => {
      const value = 1;
      const jsValue = toJS(value);
      expect(jsValue).toBe(value);
    });

    test('should object type convert success', () => {
      const value = {
        a: [
          { c: 3 },
        ],
        b: 2,
      };
      const result: any = addProxy(value, handler);
      const jsValue = toJS(result);
      expect(jsValue).toEqual(value);
    });
  });

  describe('#compose', () => {
    const arr = [];
    const middlewares = [];

    function wait (ms) {
      return new Promise((resolve) => setTimeout(resolve, ms || 1))
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

      await compose(middlewares, {}, '')();
      expect(arr).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });
});
