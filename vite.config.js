import { defineConfig, lazyPlugins } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    plugins: ["oxc", "typescript", "unicorn", "react", "vue"],
    categories: {
      correctness: "warn",
    },
    env: {
      builtin: true,
      browser: true,
    },
    rules: {
      "vue/no-arrow-functions-in-watch": "error",
      "vue/no-async-in-computed-properties": "error",
      "vue/no-computed-properties-in-data": "error",
      "vue/no-deprecated-data-object-declaration": "error",
      "vue/no-deprecated-delete-set": "error",
      "vue/no-deprecated-destroyed-lifecycle": "error",
      "vue/no-deprecated-events-api": "error",
      "vue/no-deprecated-model-definition": "error",
      "vue/no-deprecated-props-default-this": "error",
      "vue/no-deprecated-vue-config-keycodes": "error",
      "vue/no-dupe-keys": "error",
      "vue/no-export-in-script-setup": "error",
      "vue/no-expose-after-await": "error",
      "vue/no-lifecycle-after-await": "error",
      "vue/no-reserved-component-names": "error",
      "vue/no-reserved-keys": "error",
      "vue/no-reserved-props": "error",
      "vue/no-shared-component-data": "error",
      "vue/no-side-effects-in-computed-properties": "error",
      "vue/no-watch-after-await": "error",
      "vue/prefer-import-from-vue": "error",
      "vue/require-prop-type-constructor": "error",
      "vue/require-render-return": "error",
      "vue/require-slots-as-functions": "error",
      "vue/return-in-computed-property": "error",
      "vue/return-in-emits-validator": "error",
      "vue/valid-define-emits": "error",
      "vue/valid-define-options": "error",
      "vue/valid-define-props": "error",
      "vue/valid-next-tick": "error",
      "vue/component-definition-name-casing": "warn",
      "vue/prop-name-casing": "warn",
      "vue/require-default-prop": "warn",
      "vue/require-prop-types": "warn",
      "vue/no-multiple-slot-args": "warn",
      "vue/no-required-prop-with-default": "warn",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
  build: {
    // Needed so error reports on the deployed app can be symbolicated against the original source.
    sourcemap: true,
  },
  plugins: lazyPlugins(() => [
    vue(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      url: process.env.SENTRY_URL,
      release: {
        name: process.env.SENTRY_RELEASE || process.env.npm_package_version,
      },
      // No token outside CI (local/dev builds) -> skip upload instead of failing the build.
      disable: !process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        filesToDeleteAfterUpload: ["./dist/**/*.map"],
      },
    }),
  ]),
});
