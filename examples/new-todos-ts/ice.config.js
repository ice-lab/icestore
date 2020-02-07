const path = require('path');

module.exports = {
  entry: 'src/index.tsx',
  publicPath: './',
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
};

