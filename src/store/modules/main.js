const state = {
  themeDark: false,
  searchSettVisible: false,
  tableSettVisible: false
};

// noinspection JSUnusedGlobalSymbols // inspection can not see calls through namespaced commits
const mutations = {
  toggleTheme(state) {
    state.themeDark = !state.themeDark;
  },
  toggleSearchSettings(state) {
    state.searchSettVisible = !state.searchSettVisible;
  },
  toggleTableSettings(state) {
    state.tableSettVisible = !state.tableSettVisible;
  }
};

// noinspection JSUnusedGlobalSymbols // inspection can not see calls through namespaced dispatches
const actions = {
  toggleTheme({ commit }) {
    commit("toggleTheme");
  },
  toggleSearchSettings({ commit }) {
    commit("toggleSearchSettings");
  },
  toggleTableSettings({ commit }) {
    commit("toggleTableSettings");
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
