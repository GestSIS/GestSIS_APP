module.exports = {
  root: true,
  env: {
    es2021: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'plugin:prettier/recommended',
    '@vue/prettier',
    'eslint:recommended',
  ],
  plugins: ["vue", "prettier"],
  parserOptions: {
    sourceType: "module",
  },
};
