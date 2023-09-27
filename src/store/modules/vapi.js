import Vapi from "vuex-rest-api";
import { axiosInst, baseUrl } from "@/config/gemma";
import { merge } from "lodash";
import Vue from "vue";
import axios from "axios";

const vapi = new Vapi({
  baseURL: baseUrl, // assigned in store.js
  axios: axiosInst,
  state: {
    datasetsAnnotationsByCategory: {},
    pending: {
      datasetsAnnotationsByCategory: {}
    },
    error: {
      datasetsAnnotationsByCategory: {}
    }
  }
});

/**
 * Register an endpoint.
 *
 * TODO: use the OpenAPI specification for registering endpoints.
 *
 * @param action the action name, which matches the operationId in the OpenAPI specification
 * @param property the property named used as a key in the state
 * @param path the path or path function
 * @param config extra config
 * @returns {Vapi|*}
 */
vapi.endpoint = function(action, property, path, config = {}) {
  // Add Vapi state properties required for proper functionality
  this.resource.state[property] = {};

  // add /rest/v2 prefix to path (or path function)
  if (typeof (path) === "function") {
    let origPath = path;
    path = () => "/rest/v2" + origPath(...arguments);
  } else {
    path = "/rest/v2" + path;
  }

  // Add the endpoint get call
  return this.get(merge({
    action: action,
    property: property,
    path: path,
    queryParams: false,
    headers() {
      let h = { "X-Requested-With": "XMLHttpRequest" };
      if (window.clientId !== undefined) {
        h["X-Gemma-Client-ID"] = window.clientId;
      }
      return h;
    },
    onSuccess(state, payload) {
      if (payload.data.error) {
        state.error[property] = payload.data.error;
      } else {
        state[property] = payload.data;
      }
    },
    onError(state, error) {
      if (axios.isCancel(error)) {
        console.warn("Request was cancelled, will retain current state for '" + property + "'.");
      } else {
        state.error[property] = error;
      }
    }
  }, config));
};

export default vapi
  .endpoint("getRoot", "root", "/")
  .endpoint("getOpenApiSpecification", "openApiSpecification", "/openapi.json")
  .endpoint("getDatasets", "datasets", "/datasets", { queryParams: true })
  .endpoint("getDatasetsCategories", "datasetsCategories", "/datasets/categories", { queryParams: true })
  .endpoint("getDatasetsAnnotationsByCategory", null, "/datasets/annotations", {
    queryParams: true,
    beforeRequest(state, { params }) {
      Vue.set(state.pending["datasetsAnnotationsByCategory"], params.category, true);
    },
    onSuccess(state, payload, axios, { params }) {
      if (payload.data.error) {
        state.error["datasetsAnnotationsByCategory"] = payload.data.error;
      } else {
        Vue.set(state["datasetsAnnotationsByCategory"], params.category, payload.data);
        Vue.set(state.error["datasetsAnnotationsByCategory"], params.category, null);
      }
      Vue.set(state.pending["datasetsAnnotationsByCategory"], params.category, false);
    },
    onError(state, error, axios, { params }) {
      Vue.set(state.error["datasetsAnnotationsByCategory"], params.category, error);
      Vue.set(state.pending["datasetsAnnotationsByCategory"], params.category, false);
    }
  })
  .endpoint("getDatasetsPlatforms", "datasetsPlatforms", "/datasets/platforms", { queryParams: true })
  .endpoint("getDatasetsTaxa", "datasetsTaxa", "/datasets/taxa", { queryParam: true })
  .endpoint("getTaxa", "taxa", "/taxa")
  .endpoint("getMyself", "myself", "/users/me", {
    onSuccess(state, payload) {
      if (payload.data.error) {
        if (payload.data.error.code === 401) {
          state["myself"] = {};
        } else {
          state.error["myself"] = payload.data.error;
        }
      } else {
        state["myself"] = payload.data;
      }
    },
    onError(state, error) {
      if (axios.isCancel(error)) {
        console.warn("Request was cancelled, will retain current state for 'myself'.");
      } else {
        state.error["myself"] = error;
      }
    }
  })
  .getStore({
    createStateFn: true // Using modules
  });
