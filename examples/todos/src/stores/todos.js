export default {
  dataSource: [],
  foo: 1,
  async refresh() {
    this.dataSource = await new Promise(resolve =>
      setTimeout(() => {
        resolve([
          {
            name: 'react'
          },
          {
            name: 'vue',
            done: true
          },
          {
            name: 'angular'
          }
        ]);
      }, 1000)
    );
  },
  add(todo) {
    this.dataSource.push(todo);
  },
  remove(index) {
    this.dataSource.splice(index, 1);
  },
  toggle(index) {
    this.dataSource[index].done = !this.dataSource[index].done;
  }
};
