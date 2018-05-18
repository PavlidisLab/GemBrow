const state = {
  limit: 20,
  offset: 0
};

const mutations = {
  setLimit(state, limit) {
    state.limit = limit;
  },
  setOffset(state, offset) {
    state.offset = offset;
  }
};

const actions = {
  setLimit({ commit }, limit) {
    commit("setLimit", limit);
  },
  setOffset({ commit }, offset) {
    commit("setOffset", offset);
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
