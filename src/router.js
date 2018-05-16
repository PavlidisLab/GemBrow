import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Platforms from "./views/Datasets.vue";
import Datasets from "./views/Platforms.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/datasets",
      name: "datasets",
      component: Datasets
    },
    {
      path: "/platforms",
      name: "platforms",
      component: Platforms
    }
  ]
});
