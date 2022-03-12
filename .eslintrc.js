module.exports = {
  root: true,
  env: {
    es2021: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'plugin:prettier/recommended',
    '@vue/prettier',
  ],
  rules: {
    'no-console': import.meta.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': import.meta.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
};
