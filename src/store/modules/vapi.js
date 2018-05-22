import Vapi from "vuex-rest-api";

const local = false;
const MSG_ERR_NO_DATA = "No data received";

const vapi = new Vapi({
  baseURL: local
    ? "localhost:8080/Gemma/rest/v2/"
    : "https://gemma.msl.ubc.ca/rest/v2",
  state: {
    dataset: null,
    platforms: [],
    datasets: [],
    cached: {
      platforms: false,
      datasets: false
    },
    error_log: {
      datasets: [],
      platforms: []
    }
  },
  computed: {}
})
  .get({
    action: "getDataset",
    property: "dataset",
    path: ({ id }) => `/datasets/${id}`
  })
  .get({
    action: "getDatasets",
    property: "datasets",
    path: ({ limit }) => `/datasets?limit=${limit}`,
    onSuccess: (state, payload) => {
      if (!payload.data || !payload.data.data) {
        state.error.datasets = MSG_ERR_NO_DATA;
        state.error_log.datasets.push({
          error: MSG_ERR_NO_DATA,
          data: payload
        });
        state.cached.datasets = !!state.datasets;
      } else {
        state.datasets = payload.data.data;
        state.cached.datasets = false;
        state.error.datasets = null;
      }
      state.pending.datasets = false;
    },
    onError: (state, error) => {
      state.error_log.datasets.push({ error: error, data: null });
      state.cached.datasets = !!state.datasets;
      if (error && error.error) {
        state.error.datasets = error.error;
      } else {
        state.error.datasets = "Can not connect to Gemma right now";
      }
    }
  })
  .get({
    action: "getPlatforms",
    property: "platforms",
    path: "/platforms"
  })
  .getStore({
    createStateFn: true // Using modules
  });

export default vapi;
