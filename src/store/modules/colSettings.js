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
  Suitability: false
};

const ds_cols = {
  namespaced: true,
  state: ds_cols_state,
  actions: StoreUtils.methods.createActions(ds_cols_state),
  mutations: StoreUtils.methods.createMutations(ds_cols_state)
};

export { ds_cols };
