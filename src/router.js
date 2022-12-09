import Vue from "vue";
import Router from "vue-router";
import NotFound from "@/views/NotFound.vue";
import Browser from "@/views/Browser";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "*",
      name: "not found",
      component: NotFound
    },
    {
      path: "/",
      name: "browser",
      component: Browser
    }
  ]
});
