import { Component } from 'react';
import { Assign } from 'utility-types';
import { ExtractIcestoreModelFromModel, ExtractIcestoreEffectsStateFromModel } from '@ice/store';
// import compose from 'lodash/fp/compose';
import store from '../store';
import { TodoList as TodoListFn } from './TodoList';
import todosModel from '../models/todos';

const { withModel, withModelEffectsState } = store;

interface MapModelToProp {
  todos: ExtractIcestoreModelFromModel<typeof todosModel>;
}

interface MapModelEffectsStateToProp {
  todosEffectsState: ExtractIcestoreEffectsStateFromModel<typeof todosModel>;
}

interface CustomProp {
  title: string;
}

type PropsWithModel = Assign<MapModelToProp, MapModelEffectsStateToProp>;
type Props = Assign<CustomProp, PropsWithModel>;

class TodoList extends Component<Props> {
  onRemove = (index) => {
    const [, actions] = this.props.todos;
    actions.remove(index);
  }

  onToggle = (index) => {
    const [, actions] = this.props.todos;
    actions.toggle(index);
  }

  render() {
    const { title, todos, todosEffectsState } = this.props;
    const [ state ] = todos;
    const { dataSource } = state;
    return TodoListFn({
      state: { title, dataSource, subTitle: 'Class Component' },
      actions: { toggle: this.onToggle, remove: this.onRemove },
      effectsState: todosEffectsState,
    });
  }
}

export default withModelEffectsState('todos')(
  withModel('todos')(TodoList),
);

// functional flavor:
// export default compose(withModelEffectsState('todos'), withModel('todos'))(TodoList);
