import { checkModels } from '../../src/utils/checkModels';
import { counterWithUnsupportEffects, counterWithUnsupportActions } from '../helpers/counter';

describe('utils/checkModels', () => {
  it('withUnsupportEffects&withUnsupportActions', () => {
    expect(() => {
      checkModels({ counter: counterWithUnsupportEffects });
    }).toThrow();

    expect(() => {
      checkModels({ counter: counterWithUnsupportActions });
    }).toThrow();
  });
});
