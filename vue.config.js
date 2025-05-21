/* eslint-disable */
// noinspection JSUnresolvedVariable
process.env.VUE_APP_VERSION = require("./package.json").version;
module.exports = {
  publicPath: "",
  configureWebpack: {
    devtool: "source-map",
    devServer: {
      // Tomcat uses 8080 by default, so we're preventing a conflict with a local instance
      port: 8081
    }
  },
  transpileDependencies: ["vuetify"]
};
