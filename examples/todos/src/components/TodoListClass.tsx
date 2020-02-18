import { Component } from 'react';
import store from '../store';
import { TodoList } from './TodoList';
import todosModel from '../models/todos';
import { UseModelValue, ModelActionsState } from '@ice/store';

const { withModel, withModelActionsState } = store;

interface Props {
  title: string;
  todos: UseModelValue<typeof todosModel>;
  todosActionsState: ModelActionsState<typeof todosModel>;
}

class TodoListClass extends Component<Props> {
  onRemove = (index) => {
    const [, actions] = this.props.todos;
    actions.remove(index);
  }

  onToggle = (index) => {
    const [, actions] = this.props.todos;
    actions.toggle(index);
  }

  render() {
    const { title, todos, todosActionsState } = this.props;
    const [ state ] = todos;
    const { dataSource } = state;
    return TodoList({
      state: { title, dataSource, subTitle: 'Class Component' },
      actions: { toggle: this.onToggle, remove: this.onRemove },
      actionsState: todosActionsState,
    });
  }
}

export default withModelActionsState('todos')(
  withModel('todos')(TodoListClass),
);
