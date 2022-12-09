import axios from "axios";
import qs from "qs";

export default {
  /**
   * Base URL for Gemma
   */
  baseUrl: process.env.NODE_ENV === "production" ? "https://gemma.msl.ubc.ca" : "https://dev.gemma.msl.ubc.ca",
  /**
   * Axios instance suitable for querying Gemma.
   */
  axiosInst: axios.create({
    headers: null,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: "repeat" });
    }
  })
};
