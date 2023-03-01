import Vue from "vue";
import Vuex from "vuex";
import CreatePersistedState from "vuex-persistedstate";
import api from "./modules/vapi";

Vue.use(Vuex);

// noinspection JSUnresolvedVariable
const debug = process.env.NODE_ENV !== "production";

api.namespaced = true;

export default new Vuex.Store({
  plugins: [
    CreatePersistedState({
      reducer: (persistedState) => {
        const stateFilter = JSON.parse(JSON.stringify(persistedState));
        // Remove stuff we do not want to persist for any reason
        delete stateFilter.api["pending"]; // Pending is only valid at runtime
        delete stateFilter.api["error"];
        delete stateFilter.api["error_log"];
        return stateFilter;
      }
    })
  ],
  modules: {
    api: api
  },
  strict: debug
});
