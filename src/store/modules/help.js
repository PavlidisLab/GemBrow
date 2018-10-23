import StoreUtils from "../../components/StoreUtils";

// datasets state
const state = {
  help_keywords_on: false,
  help_troubled_on: false,
  help_attention_on: false,
  help_publication_on: false,
  help_quality_on: false,
  help_suitability_on: false,
  help_platforms_on: false,
  help_samples_on: false,
  help_taxon_on: false
};

export default {
  namespaced: true,
  state: state,
  actions: StoreUtils.methods.createActions(state),
  mutations: StoreUtils.methods.createMutations(state)
};
