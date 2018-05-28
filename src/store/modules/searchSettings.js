// datasets state
const ds_state = {
  limit: 20,
  offset: 0,
  sort: "%2Bid",
  taxon: null,
  score_q: null,
  score_s: null,
  updated_min: null,
  updated_max: null
};

// platforms state
const pf_state = {
  limit: 20,
  offset: 0,
  sort: "%2Bid",
  taxon: null
};

const ds = {
  namespaced: true,
  state: ds_state,
  actions: createActions(ds_state),
  mutations: createMutations(ds_state)
};

const pf = {
  namespaced: true,
  state: pf_state,
  actions: createActions(pf_state),
  mutations: createMutations(pf_state)
};

export { ds, pf };

// Helper functions

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Create standard setter mutations for all properties of the given state.
 * @param state the state to create the mutations for.
 * @returns {{}} a new object containing all mutation functions.
 */
function createMutations(state) {
  let mutations = {};
  for (let property in state) {
    if (state.hasOwnProperty(property)) {
      const fName = "set" + capitalize(property);
      mutations[fName] = function(state, value) {
        state[property] = value;
      };
    }
  }
  return mutations;
}

/**
 * Crate standard setter actions for all properties of the given state.
 * @param state the state to create the actions for.
 * @returns {{}} a new object containing all action functions.
 */
function createActions(state) {
  let actions = {};
  for (let property in state) {
    if (state.hasOwnProperty(property)) {
      const fName = "set" + capitalize(property);
      actions[fName] = function({ commit }, value) {
        commit(fName, value);
      };
    }
  }
  return actions;
}
