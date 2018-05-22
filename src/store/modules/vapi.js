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

/**
 * Helper function for easy attachment of new endpoints using extra properties (cached and error_log).
 * @param propName the name of the property to attach the endpoint for.
 * @returns {*|Vapi} the same vapi instance this method was called on.
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

    /**
     * Custom success functionality utilizing the cache and error log. Note that this method also handles all the
     * 400 and 500 http status errors, as
     */
    onSuccess(state, payload) {
      // handle errors
      if (payload.data && payload.data.error) {
        state.error_log[propName].push(payload.data.error);
        state.cached[propName] = !!state[propName];
        state.error[propName] = payload.data.error.message;
        return;
      }

      // Handle success
      if (payload.data && payload.data.data) {
        state[propName] = payload.data.data;
        state.cached[propName] = false;
        state.error[propName] = null;
      } else {
        state.error[propName] = MSG_ERR_NO_DATA;
        state.error_log[propName].push({
          error: MSG_ERR_NO_DATA,
          data: payload
        });
        state.cached[propName] = !!state[propName];
      }
      state.pending[propName] = false;
    },

    /**
     * Custom error functionality utilizing the cache and error log. Note that 400 and 500 http errors are actually
     * handled in the onSuccess method, so this method only handles errors on higher layers.
     */
    onError(state, error) {
      state.error_log[propName].push({ error });
      state.cached[propName] = !!state[propName];
      state.error[propName] = "Can not connect to Gemma right now";
    },

    /**
     * Set custom validate status, that allows all 400 and 500 http states to be passed into the onSuccess method.
     * This is necessary because Vapi passes a useless JS Error to the onError method, instead of the response
     * payload.
     */
    requestConfig: {
      validateStatus(status) {
        return status >= 200 && status < 600; // default
      }
    }
  });
};

export default vapi
  .attachEndpoint(C_DSS)
  .attachEndpoint(C_PFS)
  .getStore({
    createStateFn: true // Using modules
  });
