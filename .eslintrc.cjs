const { getESLintConfig } = require('@applint/spec');

module.exports = getESLintConfig('common-ts', {
  env: {
    jest: true,
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
});
