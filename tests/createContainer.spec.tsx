import React from 'react';
import * as rhl from '@testing-library/react-hooks';
import { createUseContainer } from '../src/createContainer';

const NO_PROVIDER = '_NP_' as any;

describe('createContainer', () => {
  it('throws if component is not wrapped in provider', () => {
    const Context = React.createContext(NO_PROVIDER);

    const useContainer = createUseContainer(Context);

    const { result } = rhl.renderHook(() => useContainer());

    expect(result.error.message).toMatch('Component must be wrapped within a Provider.');
  });
});