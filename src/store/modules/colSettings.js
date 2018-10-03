import StoreUtils from "../../components/StoreUtils";

const ds_cols_state = {
  ID: false,
  Accession: true,
  Name: true,
  Taxon: true,
  Updated: true,
  Platforms: false,
  Curation: true,
  Usability: false,
  Quality: true,
  Suitability: false,
  Gemma: true
};

const ds_cols = {
  namespaced: true,
  state: ds_cols_state,
  actions: StoreUtils.methods.createActions(ds_cols_state),
  mutations: StoreUtils.methods.createMutations(ds_cols_state)
};

const pf_cols_state = {
  ID: false,
  Accession: true,
  Name: true,
  Taxon: true,
  Updated: true,
  Experiments: false,
  Curation: true,
  Usability: false,
  Gemma: true
};

const pf_cols = {
  namespaced: true,
  state: pf_cols_state,
  actions: StoreUtils.methods.createActions(pf_cols_state),
  mutations: StoreUtils.methods.createMutations(pf_cols_state)
};

export { ds_cols, pf_cols };
