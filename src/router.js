import Vue from "vue";
import Router from "vue-router";
import NotFound from "@/views/NotFound.vue";
import Browser from "@/views/Browser";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "*",
      component: NotFound
    },
    {
      path: "/",
      component: Browser
    },
    {
      path: "/t/:initialTaxon",
      component: Browser,
      props: true
    },
    {
      path: "/t/:initialTaxon/q/:query",
      component: Browser,
      props: true
    },
    {
      path: "/:preset",
      component: Browser,
      props: true
    },
    {
      path: "/q/:query",
      component: Browser,
      props: true
    }
  ]
});
