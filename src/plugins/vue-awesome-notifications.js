import AWN from 'awesome-notifications';

// TODO: Migrate to a proper useFunction instead of inject
// Much easier once all components have been migrated to vue 3
const VueAWN = {
  install(app, options) {
    if (!options) {
      options = {};
    }
    const awn = new AWN(options);
    app.provide('awn', awn);
    app.config.globalProperties.$awn = awn;
  },
};
export default VueAWN;
