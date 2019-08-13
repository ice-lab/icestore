import { compose } from '../src/util';

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
      return new Promise((resolve) => setTimeout(resolve, ms || 1))
    }
    test('should work', async () => {
      middlewares.push((store, next) => async (actionType, ...args) => {
        arr.push(1);
        await wait(1);
        await next();
        await wait(1);
        arr.push(6);
      });
      middlewares.push((store, next) => async (actionType, ...args) => {
        arr.push(2);
        await wait(1);
        await next();
        await wait(1);
        arr.push(5);
      });
      middlewares.push((store, next) => async (actionType, ...args) => {
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
