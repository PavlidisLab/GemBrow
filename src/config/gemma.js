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
  }),
  blacklistedTerms: new Set([
    "http://www.ebi.ac.uk/efo/EFO_0000562",
    "http://purl.obolibrary.org/obo/CHEBI_23367",
    "http://mged.sourceforge.net/ontologies/MGEDOntology.owl#LabelCompound",
    "http://mged.sourceforge.net/ontologies/MGEDOntology.owl#MaterialType",
    "http://www.ebi.ac.uk/efo/EFO_0005066",
    "http://www.ebi.ac.uk/efo/EFO_0005067"
  ])
};
