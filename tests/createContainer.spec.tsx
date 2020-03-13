import { renderHook } from '@testing-library/react-hooks';
import { createContainer, createUseContainer } from '../src/createContainer';

const NO_PROVIDER = '_NP_' as any;

describe('createContainer', () => {
  it('throws if component is not wrapped in provider', () => {

    // const useContainer = createUseContainer(NO_PROVIDER);
    // const { result } = renderHook(() => useContainer());
    // console.log(result.current, result.error);
    // expect(result.error).toEqual(Error('Component must be wrapped within a Provider.'));
  });
});