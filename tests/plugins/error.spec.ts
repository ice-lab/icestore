import createErrorPlugin from '../../src/plugins/error';

describe('createErrorPlugin', () => {
  describe('validate config', () => {
    test('should not throw error when not passing config', () => {
      expect(() => createErrorPlugin()).not.toThrow();
    });

    test('throw an error when the type of name is not string', () => {
      const config = { name: 1 } as any;
      expect(() => createErrorPlugin(config)).toThrow(/error plugin config name must be a string/);
    });

    test('throw an error when the type of asNumber is not boolean', () => {
      const config = { asNumber: 1 } as any;
      expect(() => createErrorPlugin(config)).toThrow(/error plugin config asNumber must be a boolean/);
    });

    test('throw an error when the whitelist is not an array', () => {
      const config = { whitelist: 'whitelist' } as any;
      expect(() => createErrorPlugin(config)).toThrow(/error plugin config whitelist must be an array of strings/);
    });

    test('throw an error when the blacklist is not an array', () => {
      const config = { blacklist: 'blacklist' } as any;
      expect(() => createErrorPlugin(config)).toThrow(/error plugin config blacklist must be an array of strings/);
    });

    test('throw an error when pass both the whitelist and the blacklist', () => {
      const config = { blacklist: [], whitelist: [] } as any;
      expect(() => createErrorPlugin(config)).toThrow(/error plugin config cannot have both a whitelist & a blacklist/);
    });
  });
});
