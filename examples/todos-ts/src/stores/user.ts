export interface User {
  name?: string;
  age?: number;
}

export interface UserStore {
  dataSource: User;
  auth: boolean;
  todos: number;
  login: () => void;
  setTodos: (todos: number) => void;
}

const store: UserStore = {
  dataSource: {
  },
  todos: 0,
  auth: false,
  async login() {
    this.dataSource = await new Promise(resolve =>
      setTimeout(() => {
        resolve({
          name: 'Alvin',
          age: 18,
        });
      }, 1000),
    );
    this.auth = true;
  },
  setTodos(todos: number) {
    this.todos = todos;
  }
};

export default store;
