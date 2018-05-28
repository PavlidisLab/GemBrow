const state = {
  themeDark: false,
  searchSettVisible: true
};

// noinspection JSUnusedGlobalSymbols // inspection can not see calls through namespaced commits
const mutations = {
  toggleTheme(state) {
    state.themeDark = !state.themeDark;
  },
  toggleSearchSettings(state) {
    state.searchSettVisible = !state.searchSettVisible;
  }
};

// noinspection JSUnusedGlobalSymbols // inspection can not see calls through namespaced dispatches
const actions = {
  toggleTheme({ commit }) {
    commit("toggleTheme");
  },
  toggleSearchSettings({ commit }) {
    commit("toggleSearchSettings");
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
