import validate from '../../utils/validate';

describe('utils/validate', () => {
  it('will throw Error', () => {
    const model: any = {};
    expect(() => {
      validate([[model.state === undefined, 'model state is required']]);
    }).toThrowError(/^model state is required$/);
  });

  it('will throw Error', () => {
    const model = { state: 0, name: 'test' };
    expect(() => {
      validate([[model.state === undefined, 'model state is required']]);
    }).not.toThrowError();
  });
});
