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
    return { title: null, filterSummary: null, filterDescription: null, debug: debug, lastError: null };
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
    setFilterDescription(state, newVal) {
      state.filterDescription = newVal;
    },
    setLastError(state, newVal) {
      state.lastError = newVal;
    }
  },
  plugins: [
    CreatePersistedState({
      reducer: (persistedState) => {
        // copy objects to avoid modifying the original state
        const stateFilter = { ...persistedState, api: { ...persistedState.api } };
        // pending requests and errors is only valid at runtime
        delete stateFilter.api["pending"];
        delete stateFilter.api["error"];
        delete stateFilter["title"];
        delete stateFilter["filterSummary"];
        delete stateFilter["filterDescription"];
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
