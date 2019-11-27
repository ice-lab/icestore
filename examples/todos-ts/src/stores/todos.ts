interface Todo {
  name: string;
  done?: boolean;
}

export interface TodoStore {
  dataSource: Todo[];
  refresh: () => void;
  add: (todo: Todo) => Todo;
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
      }, 1000)
    );
  },
  add(todo) {
    this.dataSource.push(todo);
    return todo;
  },
  remove(index) {
    this.dataSource.splice(index, 1);
  },
  toggle(index) {
    this.dataSource[index].done = !this.dataSource[index].done;
  },
};

export default store;
