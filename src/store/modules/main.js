const state = {
  themeDark: true
};

const mutations = {
  toggleTheme(state) {
    state.themeDark = !state.themeDark;
  }
};

const actions = {};

export default {
  state,
  actions,
  mutations
};
