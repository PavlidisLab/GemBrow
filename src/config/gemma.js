import axios from "axios";
import qs from "qs";
import { marked } from "marked";

/**
 * Base URL for Gemma
 */
export let baseUrl = process.env.VUE_APP_GEMMA_BASE_URL;

/**
 * Axios instance suitable for querying Gemma.
 */
export let axiosInst = axios.create({
  withCredentials: true,
  paramsSerializer: function(params) {
    return qs.stringify(params, { arrayFormat: "repeat" });
  }
});

marked.use({
  headerIds: false,
  mangle: false,
  walkTokens(token) {
    if (token.type === "link") {
      let url = new URL(token.href, baseUrl);
      if (url.searchParams.has("query")) {
        token.href = "#/q/" + encodeURIComponent(url.searchParams.get("query"));
      }
    }
  }
});

export { marked };

/**
 * Blacklisted categories and terms.
 * @type {Set<string>}
 */
export let blacklistedTerms = new Set([
  "http://www.ebi.ac.uk/efo/EFO_0000562",
  "http://purl.obolibrary.org/obo/CHEBI_23367",
  "http://mged.sourceforge.net/ontologies/MGEDOntology.owl#LabelCompound",
  "http://mged.sourceforge.net/ontologies/MGEDOntology.owl#MaterialType",
  "http://www.ebi.ac.uk/efo/EFO_0005066",
  "http://www.ebi.ac.uk/efo/EFO_0005067"
]);