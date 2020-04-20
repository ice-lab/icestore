import React from 'react';
import { Assign } from 'utility-types';
import { ExtractIModelFromModelConfig, ExtractIModelEffectsLoadingFromModelConfig } from '@ice/store';
// import compose from 'lodash/fp/compose';
import store from '../../store';
import TodoList from './TodoList';
import todosModel from '../../models/todos';

const { withModel, withModelEffectsLoading } = store;

interface MapModelToProp {
  todos: ExtractIModelFromModelConfig<typeof todosModel>;
}

interface MapModelEffectsStateToProp {
  todosEffectsLoading: ExtractIModelEffectsLoadingFromModelConfig<typeof todosModel>;
}

interface CustomProp {
  title: string;
}

type PropsWithModel = Assign<MapModelToProp, MapModelEffectsStateToProp>;
type Props = Assign<CustomProp, PropsWithModel>;

class Component extends React.Component<Props> {
  onRemove = (index) => {
    const [, dispatchers] = this.props.todos;
    dispatchers.remove(index);
  }

  onToggle = (index) => {
    const [, dispatchers] = this.props.todos;
    dispatchers.toggle(index);
  }

  render() {
    const { title, todos, todosEffectsLoading } = this.props;
    const [ state ] = todos;
    const { dataSource } = state;
    return TodoList({
      state: { title, dataSource, subTitle: 'Class Component' },
      dispatchers: { toggle: this.onToggle, remove: this.onRemove },
      effectsLoading: todosEffectsLoading,
    });
  }
}

export default withModelEffectsLoading('todos')<PropsWithModel, Props>(
  withModel('todos')(Component),
);

// functional flavor:
// export default compose(withModelEffectsLoading('todos'), withModel('todos'))(Component);
