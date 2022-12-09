import Vue from "vue";
import vuetify from "@/plugins/vuetify";
import router from "@/router";
import store from "@/store/store";
import App from "@/App";

Vue.config.productionTip = false;

// noinspection JSUnusedGlobalSymbols
new Vue({
  el: "#app",
  vuetify,
  router,
  store,
  render: (h) => h(App)
}).$mount("#app");
