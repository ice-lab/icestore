import { convertEffects, convertActions } from '../../src/utils/converter';
import { Models, ModelEffects } from '../../src';
import { counterWithUnsupportEffects, counterWithUnsupportActions } from '../helpers/counter';
import * as warning from '../../src/utils/warning';

describe('utils/convert', () => {
  it('withUnsupportEffects', () => {
    const spy = jest.spyOn(warning, 'default');
    const models: Models = convertEffects({ counter: counterWithUnsupportEffects });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();

    const { counter } = models;
    expect(Reflect.ownKeys(counter).includes('effects')).toBe(true);
    const effects = counter.effects as (dispatch: any) => ModelEffects<any>;
    expect(Reflect.ownKeys(effects(jest.fn))).toEqual(['incrementA']);
  });

  it('withUnsupportActions', () => {
    const spy = jest.spyOn(warning, 'default');
    const models: Models = convertActions({ counter: counterWithUnsupportActions });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();

    const { counter } = models;
    expect(Reflect.ownKeys(counter).includes('effects')).toBe(true);

    const effects = counter.effects as (dispatch: any) => ModelEffects<any>;
    expect(Reflect.ownKeys(effects(jest.fn))).toEqual(['incrementA']);
  });
});
