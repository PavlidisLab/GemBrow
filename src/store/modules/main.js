const state = {
  themeDark: true,
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

const actions = {};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
