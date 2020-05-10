import createLoadingPlugin from '../../src/plugins/loading';

describe('createLoadingPlugin', () => {
  describe('validate config', () => {
    test('should not throw error when not passing config', () => {
      expect(() => createLoadingPlugin()).not.toThrow();
    });

    test('throw an error when the type of name is not string', () => {
      const config = { name: 1 } as any;
      expect(() => createLoadingPlugin(config)).toThrow(/loading plugin config name must be a string/);
    });

    test('throw an error when the type of asNumber is not boolean', () => {
      const config = { asNumber: 1 } as any;
      expect(() => createLoadingPlugin(config)).toThrow(/loading plugin config asNumber must be a boolean/);
    });

    test('throw an error when the whitelist is not an array', () => {
      const config = { whitelist: 'whitelist' } as any;
      expect(() => createLoadingPlugin(config)).toThrow(/loading plugin config whitelist must be an array of strings/);
    });

    test('throw an error when the blacklist is not an array', () => {
      const config = { blacklist: 'blacklist' } as any;
      expect(() => createLoadingPlugin(config)).toThrow(/loading plugin config blacklist must be an array of strings/);
    });

    test('throw an error when pass both the whitelist and the blacklist', () => {
      const config = { blacklist: [], whitelist: [] } as any;
      expect(() => createLoadingPlugin(config)).toThrow(/loading plugin config cannot have both a whitelist & a blacklist/);
    });
  });
});
