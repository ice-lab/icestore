import { Ctx, Middleware, ComposeFunc } from '../interface';

/**
 * Compose a middleware chain consisting of all the middlewares
 * @param {array} middlewares - middlewares user passed
 * @param {object} ctx - middleware context
 * @return {function} middleware chain
 */
export default function compose(middlewares: Middleware[], ctx: Ctx): ComposeFunc {
  return async (...args) => {
    ctx.action.arguments = args;

    function goNext(middleware, next) {
      return async () => {
        return await middleware(ctx, next);
      };
    }
    let next = async () => {
      Promise.resolve();
    };
    middlewares.slice().reverse().forEach((middleware) => {
      next = goNext(middleware, next);
    });

    return await next();
  };
}
