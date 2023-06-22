import Vapi from "vuex-rest-api";
import { axiosInst, baseUrl } from "@/config/gemma";
import { merge } from "lodash";
import axios from "axios";
import qs from "qs";

const vapi = new Vapi({
  baseURL: baseUrl, // assigned in store.js
  axios: axiosInst,
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
    openApiSpecification: undefined,
    datasets: undefined,
    datasetsAnnotations: undefined,
    datasetsPlatforms: undefined,
    platforms: undefined,
    taxa: undefined
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
    headers() {
      let h = {"X-Requested-With": "XMLHttpRequest"};
      if (window.clientId !== undefined) {
        h["X-Gemma-Client-ID"] = window.clientId;
      }
      return h;
    },
    /**
     * Custom error functionality utilizing the cache and error log. Note that 400 and 500 http errors are actually
     * handled in the onSuccess method, so this method only handles errors on higher layers.
     */
    onError(state, error) {
      if (axios.isCancel(error)) {
        state.error[property] = null;
      } else {
        state.error_log[property].push({ error });
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
  .endpoint("getDatasetsTaxa", "datasetsTaxa", "/datasets/taxa", { queryParam: true })
  .endpoint("getTaxa", "taxa", "/taxa")
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
        console.log("Params: " + qs.stringify(params, { arrayFormat: "repeat" }));
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    }
  })
  .endpoint("getMyself", "myself", "/users/me", {
    requestConfig: {
      validateStatus(status) {
        return (status >= 200 && status < 300) || status === 401;
      }
    }
  })
  .getStore({
    createStateFn: true // Using modules
  });
