import Vapi from "vuex-rest-api";
import axios from "axios";

const local = true;
const apiURL = "/rest/v2/";
const MSG_ERR_NO_DATA = "No data received";
const C_DSS = "datasets";
const C_DSS_CSV = "datasetsCsv";
const C_PFS = "platforms";
const C_TXA = "taxa";
const C_USR = "users";
const C_ANN = "annotations";
const C_DSS_Search = "datasetSearch";

const axiosInst = axios.create({
  headers: null
});

const vapi = new Vapi({
  baseURL: local ? "http://local.net:8080/Gemma" : "https://gemma.msl.ubc.ca",
  axios: axiosInst,
  state: {
    // all endpoint properties set in attachEndpoint
    cached: {},
    error_log: {},
    cancel: {}
  }
});

function p(first) {
  return first.get() ? "?" : "&";
}

function composePath(propName, id, pwd, limit, offset, sort, filter, taxon_id) {
  let path = apiURL;
  let _firstArg = true;
  let firstArg = {
    get() {
      if (_firstArg) {
        _firstArg = false;
        return true;
      }
      return _firstArg;
    },
    set(value) {
      _firstArg = value;
    }
  };

  // Filtering by taxon works differently for EEs and ADs
  if (propName === "datasets") {
    // EE taxa
    path += (taxon_id != null ? "taxa/" + taxon_id + "/" : "") + propName;
  } else {
    // ADs have taxon included in the filter
    path += propName;
  }

  // Add rest of URL parameters
  path +=
    (id ? `/${id}` : "") +
    (pwd ? p(firstArg) + `psha=${pwd}` : "") +
    (limit ? p(firstArg) + `limit=${limit}` : "") +
    (offset ? p(firstArg) + `offset=${offset}` : "") +
    (sort ? p(firstArg) + `sort=${sort}` : "") +
    (filter ? p(firstArg) + `filter=${filter}` : "");
  return path;
}

// noinspection JSUndefinedPropertyAssignment // yeah we are defining it here
vapi.attachLogoutEndpoint = function() {
  return this.get({
    action: "logout",
    path: "j_spring_security_logout",

    onSuccess(state) {
      state["users"] = null;
    },

    onError() {},
    requestConfig: {
      validateStatus(status) {
        return status >= 200 && status < 600; // default
      }
    }
  });
};

// noinspection JSUndefinedPropertyAssignment // yeah we are defining it here
/**
 * Helper function for easy attachment of new endpoints using extra properties (cached and error_log).
 * @param propName the name of the property to attach the endpoint for.
 * @param pathFunc custom function to create the call path. If none is provided, composePath is used.
 * @returns {*|Vapi} the same vapi instance this method was called on.
 */
vapi.attachEndpoint = function(propName, pathFunc) {
  // Add Vapi state properties required for proper functionality
  this.resource.state[propName] = [];
  this.resource.state.cached[propName] = false;
  this.resource.state.error_log[propName] = [];

  // Add the endpoint get call
  // noinspection SpellCheckingInspection
  return this.get({
    action: "get" + propName,
    property: propName,
    path: pathFunc
      ? pathFunc
      : ({ id, pwd, limit, offset, sort, filter, taxon_id }) =>
          composePath(propName, id, pwd, limit, offset, sort, filter, taxon_id),

    /**
     * Custom success functionality utilizing the cache and error log. Note that this method also handles all the
     * 400 and 500 http status errors, as
     */
    onSuccess(state, payload) {
      // TODO Throw away old requests that took too long to execute and another request for the same data was successful

      // Handle errors
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
      if (axios.isCancel(error)) {
        state.error[propName] = "";
      } else {
        state.error_log[propName].push({ error });
        state.cached[propName] = !!state[propName];
        state.error[propName] =
          "Can not connect to the Gemma database right now";
      }
      state.pending[propName] = false;
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

export { axiosInst };

export default vapi
  .attachEndpoint(C_DSS)
  .attachEndpoint(C_PFS)
  .attachEndpoint(C_TXA)
  .attachEndpoint(C_USR)
  .attachEndpoint(C_ANN, query => {
    return apiURL + "annotations/search/" + query;
  })
  .attachEndpoint(C_DSS_Search, query => {
    return apiURL + "annotations/search/" + query + "/datasets";
  })
  .attachEndpoint(C_DSS_CSV, ({ id, pwd, sort, filter, taxon_id }) =>
    composePath("datasets", id, pwd, "0", 0, sort, filter, taxon_id)
  )
  .attachLogoutEndpoint()
  .getStore({
    createStateFn: true // Using modules
  });
