import Vue from "vue";
import Vuex from "vuex";
import CreatePersistedState from "vuex-persistedstate";
import api from "./modules/vapi";

Vue.use(Vuex);

// noinspection JSUnresolvedVariable
const debug = process.env.NODE_ENV !== "production";

api.namespaced = true;

export default new Vuex.Store({
  state() {
    return { title: null, filterSummary: null, debug: debug, lastError: null };
  },
  mutations: {
    setDebug(state, newVal) {
      state.debug = !!newVal;
    },
    setTitle(state, newVal) {
      state.title = newVal;
    },
    setFilterSummary(state, newVal) {
      state.filterSummary = newVal;
    },
    setLastError(state, newVal) {
      state.lastError = newVal;
    }
  },
  plugins: [
    CreatePersistedState({
      reducer: (persistedState) => {
        const stateFilter = JSON.parse(JSON.stringify(persistedState));
        // Remove stuff we do not want to persist for any reason
        delete stateFilter.api["pending"]; // Pending is only valid at runtime
        delete stateFilter.api["error"];
        delete stateFilter["title"];
        delete stateFilter["filterSummary"]
        delete stateFilter["lastError"];
        return stateFilter;
      }
    })
  ],
  modules: {
    api: api
  },
  strict: debug
});
