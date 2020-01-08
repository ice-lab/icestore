import compose from '../src/util/compose';
import shallowEqual from '../src/util/shallowEqual';

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

  describe('#shallowEqual', () => {
    test('should return true if arguments fields are equal', () => {
      expect(
        shallowEqual({ a: 1, b: 2, c: undefined }, { a: 1, b: 2, c: undefined }),
      ).toBe(true);

      expect(
        shallowEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3 }),
      ).toBe(true);

      const o = {};
      expect(
        shallowEqual({ a: 1, b: 2, c: o }, { a: 1, b: 2, c: o }),
      ).toBe(true);

      const d = function() {
        return 1;
      };
      expect(
        shallowEqual({ a: 1, b: 2, c: o, d }, { a: 1, b: 2, c: o, d }),
      ).toBe(true);
    });

    test('should return false if arguments fields are different function identities', () => {
      expect(
        shallowEqual(
          {
            a: 1,
            b: 2,
            d() {
              return 1;
            },
          },
          {
            a: 1,
            b: 2,
            d() {
              return 1;
            },
          },
        ),
      ).toBe(false);
    });

    test('should return false if first argument has too many keys', () => {
      expect(shallowEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2 })).toBe(false);
    });

    test('should return false if second argument has too many keys', () => {
      expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2, c: 3 })).toBe(false);
    });

    test('should return false if arguments have different keys', () => {
      expect(
        shallowEqual(
          { a: 1, b: 2, c: undefined },
          { a: 1, bb: 2, c: undefined },
        ),
      ).toBe(false);
    });

    test('should compare two NaN values', () => {
      expect(shallowEqual(NaN, NaN)).toBe(true);
    });

    test('should compare empty objects, with false', () => {
      expect(shallowEqual({}, false)).toBe(false);
      expect(shallowEqual(false, {})).toBe(false);
      expect(shallowEqual([], false)).toBe(false);
      expect(shallowEqual(false, [])).toBe(false);
    });

    test('should compare two zero values', () => {
      expect(shallowEqual(0, 0)).toBe(true);
    });
  });
});
