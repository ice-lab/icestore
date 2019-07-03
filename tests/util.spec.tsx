import { addProxy } from '../src/util';

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
    test('should function type not affected', () => {
      const value = () => {};
      expect(addProxy(value, handler)).toBe(value);
    });

    test('should object proxy set success', () => {
      const value = {
        a: 1,
        b: 2,
      };
      const result = addProxy(value, handler);
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
      const result = addProxy(value, handler);
      result.a[0].c = 4;
      expect(result.a[0].c).toBe('foo');
    });

    test('should array proxy set success', () => {
      const value = [1, 2];
      const result = addProxy(value, handler);
      result[0] = 4;
      expect(result[0]).toBe('foo');
    });

    test('should array proxy recursively set success', () => {
      const value = [
        { a: 1 },
      ];
      const result = addProxy(value, handler);
      result[0].a = 4;
      expect(result[0].a).toBe('foo');
    });
  });
});
