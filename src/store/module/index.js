import camelCase from 'lodash.camelcase';
// Storing in variable a context with all files in this folder
// ending with `.js`.
const requireModule = import.meta.globEager('./*.js');
const modules = {};

Object.keys(requireModule).forEach((fileName) => {
  if (fileName === './index.js') return;
  // filter fullstops and extension
  // and return a camel-case name for the file
  const moduleName = camelCase(fileName.replace(/(\.\/|\.js)/g, ''));
  // create a dynamic object with all modules
  modules[moduleName] = {
    // add namespace here
    ...requireModule[fileName].default,
    // if you have exported the object with name in the module `js` file
    // e.g., export const name = {};
    // uncomment this line and comment the above
    // ...requireModule(fileName)[moduleName]
  };
});
export default modules;
