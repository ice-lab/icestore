import { checkModels } from '../../src/utils/checkModels';
import { counterWithUnsupportedEffects, counterWithUnsupportedActions } from '../helpers/counter';

describe('utils/checkModels', () => {
  it('withUnsupportedEffects & withUnsupportedActions', () => {
    expect(() => {
      checkModels({ counter: counterWithUnsupportedEffects });
    }).toThrow();

    expect(() => {
      checkModels({ counter: counterWithUnsupportedActions });
    }).toThrow();
  });
});
