import createIcestore from '@ice/store';
import logger from '@ice/store-logger';
import todos from './todos';
import user from './user';

const middlewares: ((ctx, next) => {})[] = [];

if (process.env.NODE_ENV !== 'production') {
  middlewares.push(logger);
}

export default createIcestore({todos, user}, {middlewares});

