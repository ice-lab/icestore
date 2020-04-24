import store from '../../store';
import User from './User';

const { useModel } = store;

export default function({ title }) {
  const [ state ] = useModel('user');
  return User(
    {
      type: 'Function',
      name: state.name,
      title,
    },
  );
}
