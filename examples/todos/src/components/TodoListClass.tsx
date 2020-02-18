import { Component } from 'react';
import store from '../store';
import { TodoList } from './TodoList';

const { withModel, withModelActionsState, models } = store;
const [ , useModelState, useModelActions, useModelActionsState ] = models.todos;

interface Props {
  title: string;
  todos: [ ReturnType<typeof useModelState>, ReturnType<typeof useModelActions> ];
  todosActionsState: typeof useModelActionsState;
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
