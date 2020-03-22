export default class Dispatcher {
  callbacks: any = {};

  data: any = {};

  update = (namespace: string) => {
    (this.callbacks[namespace] || []).forEach(
      (callback: (val: any) => void) => {
        try {
          const data = this.data[namespace];
          callback(data);
        } catch (e) {
          callback(undefined);
        }
      },
    );
  };
}
