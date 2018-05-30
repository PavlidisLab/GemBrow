// datasets state
const ds_state = {
  limit: 20,
  offset: 0,
  sort: "%2Bid",
  troubled_on: false,
  troubled: false,
  attention_on: false,
  attention: false,
  score_q_min_on: false,
  score_q_min: 0,
  score_s_min_on: false,
  score_s_min: 0,
  updated_min: null,
  updated_max: null,
  publication_on: true,
  publication: 1
};

// dataset getters, aka computed state properties
// noinspection JSUnusedGlobalSymbols // inspection can not see usage through getters
const ds_getters = {
  filter(state) {
    const filters = [
      { value: "troubled", url: "curationDetails.troubled", op: " = " },
      { value: "attention", url: "curationDetails.needsAttention", op: " = " },
      { value: "score_q_min", url: "geeq.detectedQualityScore", op: " >= " },
      {
        value: "score_s_min",
        url: "geeq.detectedSuitabilityScore",
        op: " >= "
      },
      { value: "publication", url: "geeq.sScorePublication", op: " = " }
    ];
    let and = false;
    let str = "";
    for (let filter of filters) {
      if (state[filter.value + "_on"]) {
        str +=
          (and ? " AND " : "") + filter.url + filter.op + state[filter.value];
        and = true;
      }
    }
    return str;
  }
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
  getters: ds_getters,
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
