interface ComposeFunc {
  (): void;
}

interface Ctx {
  action: {
    name: string;
    arguments: any[];
  };
  store: {
    namespace: string;
    getState: () => object;
  };
}

/**
 * Compose a middleware chain consisting of all the middlewares
 * @param {array} middlewares - middlewares user passed
 * @param {object} ctx - middleware context
 * @return {function} middleware chain
 */
export function compose(middlewares: (() => void)[], ctx: Ctx): ComposeFunc {
  return async (...args) => {
    ctx.action.arguments = args;

    function goNext(middleware, next) {
      return async () => {
        await middleware(ctx, next);
      };
    }
    let next = async () => {
      Promise.resolve();
    };
    middlewares.slice().reverse().forEach((middleware) => {
      next = goNext(middleware, next);
    });
    try {
      await next();
    } catch (e) {
      console.error(e);
    }
  };
}
