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
export let blacklistedTerms = [
  "http://gemma.msl.ubc.ca/ont/TGEMO_00001", // homozygous negative
  "http://gemma.msl.ubc.ca/ont/TGEMO_00003", // heterozygous
  "http://gemma.msl.ubc.ca/ont/TGEMO_00004", // overexpression
  "http://gemma.msl.ubc.ca/ont/TGEMO_00007", // knockdown
  "http://purl.obolibrary.org/obo/CHEBI_23367", // molecular entity
  "http://purl.obolibrary.org/obo/GO_0008150", // biological process
  "http://purl.obolibrary.org/obo/GO_0007610", // behavior
  "http://purl.obolibrary.org/obo/OBI_0000025", // reference substance role
  "http://purl.obolibrary.org/obo/OBI_0000220", // reference subject role
  "http://purl.obolibrary.org/obo/OBI_0302893", // storage
  "http://purl.obolibrary.org/obo/BFO_0000023", // role
  "http://purl.obolibrary.org/obo/PATO_0001397", // cellular potency
  "http://purl.obolibrary.org/obo/PATO_0000048", // hardness
  "http://purl.obolibrary.org/obo/PATO_0000049", // intensity
  "http://purl.obolibrary.org/obo/PATO_0002353", // activation quality
  "http://www.ebi.ac.uk/efo/EFO_0000523", // growth condition (should be excluded by role)
  "http://www.ebi.ac.uk/efo/EFO_0000410", // disease staging
  "http://www.ebi.ac.uk/efo/EFO_0000428", // dose
  "http://www.ebi.ac.uk/efo/EFO_0000507", // generation
  "http://www.ebi.ac.uk/efo/EFO_0005168", // wild type genotype
  "http://www.ebi.ac.uk/efo/EFO_0000352", // clinical history
  "http://www.ebi.ac.uk/efo/EFO_0004973", // germline genotype
  "http://www.ebi.ac.uk/efo/EFO_0004972", // somatic genotype
  "http://www.ebi.ac.uk/efo/EFO_0000542", // individual
  "http://www.ebi.ac.uk/efo/EFO_0000562", // labelling
  "http://www.ebi.ac.uk/efo/EFO_0000651", // phenotype
  "http://www.ebi.ac.uk/efo/EFO_0000724", // timepoint
  "http://www.ebi.ac.uk/efo/EFO_0001426", // study design
  "http://www.ebi.ac.uk/efo/EFO_0001646", // anatomical modifier (contains a lot of modifier terms like left/right, lateral, etc.)
  "http://www.ebi.ac.uk/efo/EFO_0004444", // environmental history
  "http://www.ebi.ac.uk/efo/EFO_0005066" // collection of material
];