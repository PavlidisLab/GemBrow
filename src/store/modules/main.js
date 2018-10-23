const state = {
  themeDark: false,
  searchSettVisible: false,
  searchHelpVisible: false,
  tableSettVisible: false,
  user: null
};

// noinspection JSUnusedGlobalSymbols // inspection can not see calls through namespaced commits
const mutations = {
  toggleTheme(state) {
    state.themeDark = !state.themeDark;
  },
  toggleSearchSettings(state) {
    state.searchSettVisible = !state.searchSettVisible;
  },
  toggleSearchHelpSettings(state) {
    state.searchHelpVisible = !state.searchHelpVisible;
  },
  toggleTableSettings(state) {
    state.tableSettVisible = !state.tableSettVisible;
  },
  login(state, user) {
    // Create a custom object from the received one
    state.user = {
      userName: user.userName,
      password: user.password,
      currentGroup: user.currentGroup,
      email: user.email,
      isAdmin: user.currentGroup === "Administrators"
    };
  },
  logout(state) {
    state.user = null;
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
  toggleSearchHelpSettings({ commit }) {
    commit("toggleSearchHelpSettings");
  },
  toggleTableSettings({ commit }) {
    commit("toggleTableSettings");
  },
  login({ commit }, user) {
    commit("login", user);
  },
  logout({ commit }) {
    commit("logout");
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
