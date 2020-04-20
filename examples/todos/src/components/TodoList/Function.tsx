import store from '../../store';
import TodoList from './TodoList';

const { useModel, useModelEffectsLoading } = store;

export default function({ title }) {
  const [ state, dispatchers ] = useModel('todos');
  const effectsLoading = useModelEffectsLoading('todos');
  return TodoList(
    {
      state: { ...state, title, subTitle: 'Function Component' },
      dispatchers,
      effectsLoading,
    },
  );
}
