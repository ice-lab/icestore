import Icestore from '@ice/store';
import debug from '@ice/store-debug';
import todos from './todos';

const icestore = new Icestore('todos');

icestore.applyMiddleware([debug]);
icestore.registerStore('todos', todos);
icestore.registerStore('foo', { foo: 1111, bar: 2222 });

export default icestore;
