module.exports = {
  root: true,
  extends: ['@react-native'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,        // ← add this
    babelOptions: {
      presets: ['babel-preset-expo'], // ← add this
    },
  },
};