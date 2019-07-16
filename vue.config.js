// vue.config.js
module.exports = {
  devServer: {
    proxy:{
      '^/api':{
        target:'https://apis.gestsis.ch/api/v2'
      },
      '^/auth':{
        target:'https://auth.gestsis.ch/api/v2'
      }
    }
  }
}
