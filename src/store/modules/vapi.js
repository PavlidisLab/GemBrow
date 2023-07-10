import Vapi from "vuex-rest-api";
import { axiosInst, baseUrl } from "@/config/gemma";
import { merge } from "lodash";
import qs from "qs";

const vapi = new Vapi({
  baseURL: baseUrl, // assigned in store.js
  axios: axiosInst
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
      if (payload.error) {
        state.error[property] = payload.error;
      } else {
        state[property] = payload.data;
      }
    }
  }, config));
};

export default vapi
  .endpoint("getRoot", "root", "/")
  .endpoint("getOpenApiSpecification", "openApiSpecification", "/openapi.json")
  .endpoint("getDatasets", "datasets", "/datasets", { queryParams: true })
  .endpoint("getDatasetsByIds", "datasets", ({ ids }) => "/datasets/" + encodeURIComponent(ids))
  .endpoint("getDatasetsAnnotations", "datasetsAnnotations", "/datasets/annotations", { queryParams: true })
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
    }
  })
  .getStore({
    createStateFn: true // Using modules
  });
