import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    themeDark: true
  },
  mutations: {
    toggleTheme() {
      this.state.themeDark = !this.state.themeDark;
    }
  },
  actions: {}
});
