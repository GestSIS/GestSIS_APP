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
  plugins: ["vue", "prettier"],
  parser: "vue-eslint-parser",
  parserOptions: {
    sourceType: "module",
  },
};
