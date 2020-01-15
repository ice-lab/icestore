import user from './user';

interface Todo {
  name: string;
  done?: boolean;
}

export interface TodoStore {
  dataSource: Todo[];
  refresh: () => void;
  add: (todo: Todo) => void;
  remove: (index: number) => void;
  toggle: (index: number) => void;
}

const store: TodoStore = {
  dataSource: [],
  async refresh() {
    this.dataSource = await new Promise(resolve =>
      setTimeout(() => {
        resolve([
          {
            name: 'react',
          },
          {
            name: 'vue',
            done: true,
          },
          {
            name: 'angular',
          },
        ]);
      }, 1000),
    );
    user.setTodos(this.dataSource.length);
  },
  add(todo) {
    this.dataSource.push(todo);
    user.setTodos(this.dataSource.length);
  },
  async remove(index) {
    await new Promise(resolve =>
      setTimeout(() => {
        resolve();
      }, 1000),
    )
    this.dataSource.splice(index, 1);
    user.setTodos(this.dataSource.length);
  },
  toggle(index) {
    this.dataSource[index].done = !this.dataSource[index].done;
  },
};

export default store;
