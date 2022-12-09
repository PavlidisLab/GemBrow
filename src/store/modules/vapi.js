import Vapi from "vuex-rest-api";
import gemmaConfig from "@/config/gemma";
import { merge } from "lodash";
import qs from "qs";

const vapi = new Vapi({
  baseURL: gemmaConfig.baseUrl, // assigned in store.js
  axios: gemmaConfig.axiosInst,
  state: {
    // all endpoint properties set in attachEndpoint
    cached: {},
    pending: {},
    error: {},
    /**
     * Logs of error.
     */
    error_log: {},
    // only for code insights, the field is initialized in vapi.endpoint() below
    openApiSpecification: {},
    search: {},
    datasets: {},
    datasetsAnnotations: {},
    datasetsPlatforms: {},
    platforms: {},
    taxa: {}
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
  this.resource.state.cached[property] = false;
  this.resource.state.error_log[property] = [];

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
    /**
     * Custom success functionality utilizing the cache and error log. Note that this method also handles all the
     * 400 and 500 http status errors, as
     */
    onSuccess(state, payload) {
      // Handle success
      state[property] = payload.data;
      state.cached[property] = false;
      state.error[property] = null;
      state.pending[property] = false;
    },

    /**
     * Custom error functionality utilizing the cache and error log. Note that 400 and 500 http errors are actually
     * handled in the onSuccess method, so this method only handles errors on higher layers.
     */
    onError(state, error, axios) {
      console.log(arguments);
      if (axios.isCancel(error)) {
        state.error[property] = "";
      } else {
        state.error_log[property].push({ error });
        state.cached[property] = !!state[property];
        state.error[property] = "Can not connect to the Gemma database right now";
      }
      state.pending[property] = false;
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
  }, config));
};

export default vapi
  .endpoint("getOpenApiSpecification", "openApiSpecification", "/openapi.json")
  .endpoint("getDatasets", "datasets", "/datasets", { queryParams: true })
  .endpoint("getDatasetsByIds", "datasets", ({ ids }) => "/datasets/" + encodeURIComponent(ids))
  .endpoint("getDatasetsAnnotations", "datasetsAnnotations", "/datasets/annotations", { queryParams: true })
  .endpoint("getDatasetsPlatforms", "datasetsPlatforms", "/datasets/platforms", { queryParams: true })
  .endpoint("getTaxa", "taxa", "/taxa")
  .endpoint("getPlatforms", "platforms", "/platforms", { queryParams: true })
  .endpoint("getPlatformsByIds", "platforms", ({ ids }) => "/platforms/" + encodeURIComponent(ids))
  .endpoint("search", "search", "/search", {
    queryParams: true,
    requestConfig: {
      paramsSerializer: function(params) {
        if (params.platform) {
          params = Object.assign({}, params, { platform: params.platform.id });
        }
        if (params.taxon) {
          params = Object.assign({}, params, { taxon: params.taxon.id });
        }
        params.limit = 100;
        console.log("Params: " + qs.stringify(params, { arrayFormat: "repeat" }));
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    }
  })
  .getStore({
    createStateFn: true // Using modules
  });
