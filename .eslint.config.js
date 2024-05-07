import pluginVue from 'eslint-plugin-vue'
export default [
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {
      'vue/script-setup-uses-vars': 'error',
    }
  }
];
