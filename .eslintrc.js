module.exports = {
  root: true,
  env: {
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended',
    '@vue/prettier',
  ],
  rules: {
    'vue/script-setup-uses-vars': 'error',
  },
  plugins: ['vue', 'prettier'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    sourceType: 'module',
  },
};
