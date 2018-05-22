import Vapi from "vuex-rest-api";

const local = false;
const MSG_ERR_NO_DATA = "No data received";
const C_DSS = "datasets";
const C_PFS = "platforms";

const vapi = new Vapi({
  baseURL: local
    ? "localhost:8080/Gemma/rest/v2/"
    : "https://gemma.msl.ubc.ca/rest/v2",
  state: {
    // all endpoint properties set in attachEndpoint
    cached: {},
    error_log: {}
  }
});

export default vapi
  .attachEndpoint(C_DSS)
  .attachEndpoint(C_PFS)
  .getStore({
    createStateFn: true // Using modules
  });

// Helper functions

/**
 * Helper function for easy attachment of new endpoints using extra properties (cached and error_log).
 * @param propName the name of the property to attach the endpoint for.
 * @returns {*|Vapi} 'this' vapi instance.
 */
vapi.attachEndpoint = function(propName) {
  // Add Vapi state properties required for proper functionality
  this.resource.state[propName] = [];
  this.resource.state.cached[propName] = false;
  this.resource.state.error_log[propName] = [];

  // Add the endpoint get call
  return this.get({
    action: "get" + propName.charAt(0).toUpperCase() + propName.slice(1),
    property: propName,
    path: ({ limit }) => "/" + propName + `?limit=${limit}`,

    // Custom success functionality utilizing the cache and error log
    onSuccess(state, payload) {
      if (!payload.data || !payload.data.data) {
        state.error[propName] = MSG_ERR_NO_DATA;
        state.error_log[propName].push({
          error: MSG_ERR_NO_DATA,
          data: payload
        });
        state.cached[propName] = !!state[propName];
      } else {
        state[propName] = payload.data.data;
        state.cached[propName] = false;
        state.error[propName] = null;
      }
      state.pending[propName] = false;
    },

    // Custom error functionality utilizing the cache and error log
    onError(state, error) {
      state.error_log[propName].push({ error: error, data: null });
      state.cached[propName] = !!state[propName];
      if (error && error.error) {
        state.error[propName] = error.error;
      } else {
        state.error[propName] = "Can not connect to Gemma right now";
      }
    }
  });
};
