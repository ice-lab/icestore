import { Component } from 'react';
import store from '../store';
import { TodoList } from './TodoList';

const { withModel, withModelActionsState } = store;

class TodoListClass extends Component<any> {
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
