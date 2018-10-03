import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import NotFound from "./views/NotFound.vue";
import Datasets from "./views/Datasets.vue";
import Platforms from "./views/Platforms.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/404",
      name: "not found",
      component: NotFound
    },
    {
      path: "*",
      redirect: "/404"
    },
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
