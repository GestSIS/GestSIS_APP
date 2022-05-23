import AWN from 'awesome-notifications';

const VueAWN = {
  install(app, options) {
    if (!options) {
      options = {};
    }
    app.config.globalProperties.$awn = new AWN(options);
  },
};
export default VueAWN;
