const { tslint, deepmerge } = require('@ice/spec');

module.exports = deepmerge(tslint, {
  env: {
    jest: true,
  },
  rules: {
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/interface-name-prefix': 1,
    'no-restricted-syntax': 1,
    'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.js'] }],
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
});
