import StoreUtils from "../../components/StoreUtils";

function formFilter(state, filters) {
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

// datasets state
const ds_state = {
  limit: 20,
  offset: 0,
  sort: "%2Bid",
  troubled_on: true,
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
  publication: 1,
  platform_amount_on: false,
  platform_amount: 1,
  taxon_on: false,
  taxon: null
};

// dataset getters, aka computed state properties
// noinspection JSUnusedGlobalSymbols // inspection can not see usage through getters
const ds_getters = {
  taxon_id(state) {
    return state.taxon_on ? state.taxon : null;
  },
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
      { value: "publication", url: "geeq.sScorePublication", op: " = " },
      { value: "platform_amount", url: "geeq.sScorePlatformAmount", op: " = " }
    ];
    return formFilter(state, filters);
  }
};

// platforms state
const pf_state = {
  limit: 20,
  offset: 0,
  sort: "%2Bid",
  troubled_on: true,
  troubled: false,
  attention_on: false,
  attention: false,
  updated_min: null,
  updated_max: null,
  // experiment_amount_on: false,
  // experiment_amount: 1,
  taxon_on: false,
  taxon: null
};

// platform getters, aka computed state properties
// noinspection JSUnusedGlobalSymbols // inspection can not see usage through getters
const pf_getters = {
  taxon_id(state) {
    return state.taxon_on ? state.taxon : null;
  },
  filter(state) {
    const filters = [
      { value: "troubled", url: "curationDetails.troubled", op: " = " },
      { value: "attention", url: "curationDetails.needsAttention", op: " = " },
      {
        value: "experiment_amount",
        url: "expressionExperimentCount",
        op: " = "
      }
    ];
    return formFilter(state, filters);
  }
};

const ds = {
  namespaced: true,
  state: ds_state,
  getters: ds_getters,
  actions: StoreUtils.methods.createActions(ds_state),
  mutations: StoreUtils.methods.createMutations(ds_state)
};

const pf = {
  namespaced: true,
  state: pf_state,
  getters: pf_getters,
  actions: StoreUtils.methods.createActions(pf_state),
  mutations: StoreUtils.methods.createMutations(pf_state)
};

export { ds, pf };
