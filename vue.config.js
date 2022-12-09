/* eslint-disable */
// noinspection JSUnresolvedVariable
module.exports = {
  publicPath: "",
  configureWebpack: {
    devServer: {
      // Tomcat uses 8080 by default, so we're preventing a conflict with a local instance
      port: 8081
    }
  },
  transpileDependencies: ["vuetify"]
};
