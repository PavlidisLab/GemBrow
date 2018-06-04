<script>
import viewUtils from "./ViewUtils";

export default {
  methods: {
    /**
     * Create standard setter mutations for all properties of the given state.
     * @param state the state to create the mutations for.
     * @returns {{}} a new object containing all mutation functions.
     */
    createMutations(state) {
      let mutations = {};
      for (let property in state) {
        if (state.hasOwnProperty(property)) {
          const fName = "set" + viewUtils.methods.capitalize(property);
          mutations[fName] = function(state, value) {
            state[property] = value;
          };
        }
      }
      return mutations;
    },

    /**
     * Crate standard setter actions for all properties of the given state.
     * @param state the state to create the actions for.
     * @returns {{}} a new object containing all action functions.
     */
    createActions(state) {
      let actions = {};
      for (let property in state) {
        if (state.hasOwnProperty(property)) {
          const fName = "set" + viewUtils.methods.capitalize(property);
          actions[fName] = function({ commit }, value) {
            commit(fName, value);
          };
        }
      }
      return actions;
    }
  }
};
</script>
