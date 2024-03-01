// noinspection HttpUrlsUsage

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

export let excludedCategories = [
  "http://mged.sourceforge.net/ontologies/MGEDOntology.owl#BioSourceType", // BioSourceType
  "http://mged.sourceforge.net/ontologies/MGEDOntology.owl#LabelCompound", // LabelCompound
  "http://mged.sourceforge.net/ontologies/MGEDOntology.owl#MaterialType", // MaterialType
  "http://purl.obolibrary.org/obo/CHEBI_23367", // molecular entity
  "http://purl.obolibrary.org/obo/GO_0007610", // behavior
  "http://purl.obolibrary.org/obo/GO_0008150", // biological process
  "http://purl.obolibrary.org/obo/OBI_0000272", // protocol
  "http://purl.obolibrary.org/obo/OBI_0100051", // specimen
  "http://purl.obolibrary.org/obo/OBI_0302893", // storage
  "http://purl.obolibrary.org/obo/SO_0001024", // haplotypes
  "http://purl.obolibrary.org/obo/UO_0000003", // time units
  "http://www.ebi.ac.uk/efo/EFO_0000246", // Ages (generally useless because it is continuous)
  "http://www.ebi.ac.uk/efo/EFO_0000322", // cell line (we use CLO and not EFO)
  "http://www.ebi.ac.uk/efo/EFO_0000352", // clinical history
  "http://www.ebi.ac.uk/efo/EFO_0000410", // disease staging
  "http://www.ebi.ac.uk/efo/EFO_0000428", // dose
  "http://www.ebi.ac.uk/efo/EFO_0000470", // environment stress
  "http://www.ebi.ac.uk/efo/EFO_0000507", // generation
  "http://www.ebi.ac.uk/efo/EFO_0000523", // growth condition (should be excluded by role)
  "http://www.ebi.ac.uk/efo/EFO_0000542", // individual
  "http://www.ebi.ac.uk/efo/EFO_0000562", // labelling
  "http://www.ebi.ac.uk/efo/EFO_0000651", // phenotype
  "http://www.ebi.ac.uk/efo/EFO_0000724", // time point
  "http://www.ebi.ac.uk/efo/EFO_0001426", // study design
  "http://www.ebi.ac.uk/efo/EFO_0001444", // measurement
  "http://www.ebi.ac.uk/efo/EFO_0001702", // temperature
  "http://www.ebi.ac.uk/efo/EFO_0004425", // initial time points
  "http://www.ebi.ac.uk/efo/EFO_0004444", // environmental history
  "http://www.ebi.ac.uk/efo/EFO_0005066", // collection of material
  "http://www.ebi.ac.uk/efo/EFO_0005067", // block
  "http://www.ebi.ac.uk/efo/EFO_0005136"  // strains
];

/**
 * Excluded terms.
 *
 * Inference is applied in the backend to include all the subclasses of the following terms. Thus, one must be careful
 * to not put a term that is too general.
 */
export let excludedTerms = [
  "http://purl.obolibrary.org/obo/SO_0000287", // fusion gene
  "http://gemma.msl.ubc.ca/ont/TGEMO_00001", // homozygous negative
  "http://gemma.msl.ubc.ca/ont/TGEMO_00003", // heterozygous
  "http://gemma.msl.ubc.ca/ont/TGEMO_00004", // over-expression
  "http://gemma.msl.ubc.ca/ont/TGEMO_00007", // knockdown
  "http://gemma.msl.ubc.ca/ont/TGEMO_00122", // unspecified factor value
  "http://purl.obolibrary.org/obo/OBI_0000025", // reference substance role
  "http://purl.obolibrary.org/obo/OBI_0000220", // reference subject role
  "http://purl.obolibrary.org/obo/PATO_0000048", // hardness
  "http://purl.obolibrary.org/obo/PATO_0000049", // intensity
  "http://purl.obolibrary.org/obo/PATO_0000261", // maturity
  "http://purl.obolibrary.org/obo/PATO_0000937", // disorganized
  "http://purl.obolibrary.org/obo/PATO_0001178", // resistant to
  "http://purl.obolibrary.org/obo/PATO_0001397", // cellular potency
  "http://purl.obolibrary.org/obo/PATO_0002011", // tumorous
  "http://purl.obolibrary.org/obo/PATO_0002104", // inflammatory
  "http://purl.obolibrary.org/obo/PATO_0002353", // activation quality
  "http://purl.obolibrary.org/obo/PATO_0002122", // mixed
  "http://www.ebi.ac.uk/efo/EFO_0000562", // labelling
  "http://www.ebi.ac.uk/efo/EFO_0001461", // control
  "http://www.ebi.ac.uk/efo/EFO_0001646", // anatomical modifier (contains a lot of modifier terms like left/right, lateral, etc.)
  "http://www.ebi.ac.uk/efo/EFO_0004425", // initial time point
  "http://www.ebi.ac.uk/efo/EFO_0004952", // disease recurrence
  "http://www.ebi.ac.uk/efo/EFO_0004972", // somatic genotype
  "http://www.ebi.ac.uk/efo/EFO_0004973", // germ line genotype
  "http://www.ebi.ac.uk/efo/EFO_0005168", // wild type genotype
  // gemma does not have the NCBI taxon ontology loaded, so we have to do it one-by-one
  "http://purl.obolibrary.org/obo/NCBITaxon_10090",
  "http://purl.obolibrary.org/obo/NCBITaxon_10116",
  "http://purl.obolibrary.org/obo/NCBITaxon_11082",
  "http://purl.obolibrary.org/obo/NCBITaxon_11320",
  "http://purl.obolibrary.org/obo/NCBITaxon_11623",
  "http://purl.obolibrary.org/obo/NCBITaxon_1280",
  "http://purl.obolibrary.org/obo/NCBITaxon_1639",
  "http://purl.obolibrary.org/obo/NCBITaxon_227859", // SARS coronavirus (appears under disease, but we already have COVID 19)
  "http://purl.obolibrary.org/obo/NCBITaxon_562",
  "http://purl.obolibrary.org/obo/NCBITaxon_5811",
  "http://purl.obolibrary.org/obo/NCBITaxon_6239"
];

export let annotationSelectorOrderArray = [
  "http://www.ebi.ac.uk/efo/EFO_0000408", // disease
  "http://www.ebi.ac.uk/efo/EFO_0000513", // genotype
  "http://www.ebi.ac.uk/efo/EFO_0000727", // treatment
  "http://www.ebi.ac.uk/efo/EFO_0000635", // organism part
  "http://www.ebi.ac.uk/efo/EFO_0000324", // cell type
  "http://www.ebi.ac.uk/efo/EFO_0005135", // strain 
  "http://purl.obolibrary.org/obo/CLO_0000031", // cell line
  "http://www.ebi.ac.uk/efo/EFO_0000399", // developmental stage
  "http://purl.obolibrary.org/obo/PATO_0000047", // biological sex
  "http://gemma.msl.ubc.ca/ont/TGEMO_00101", // disease model this might get merged later
  "http://www.ebi.ac.uk/efo/EFO_0002755", // diet 
  "http://www.ebi.ac.uk/efo/EFO_0000246", // age 
  "http://purl.obolibrary.org/obo/OBI_0000181", // population 
  "http://www.ebi.ac.uk/efo/EFO_0002571" // medical procedure 
];

/**
 * List of ontology sources.
 *
 * Use pattern to match a term URI and getExternalUrl() to produce a link to the external ontology browser.
 */
export let ontologySources = [
  {
    name: "Gemma Ontology",
    pattern: /http:\/\/gemma\.msl\.ubc\.ca\//,
    getExternalUrl(uri) {
      return uri.replace("http://gemma.msl.ubc.ca", baseUrl);
    }
  },
  {
    name: "Experimental Factor Ontology",
    pattern: /http:\/\/www\.ebi\.ac\.uk\/efo\/EFO_.+/,
    getExternalUrl(uri) {
      return "https://www.ebi.ac.uk/ols/ontologies/efo/terms?iri=" + encodeURIComponent(uri);
    }
  },
  {
    name: "Ontology for Biomedical Investigations",
    pattern: /http:\/\/purl\.obolibrary\.org\/obo\/OBI_.+/,
    getExternalUrl(uri) {
      return "https://ontobee.org/ontology/OBI?iri=" + encodeURIComponent(uri);
    }
  },
  {
    name: "Phenotype And Trait Ontology",
    pattern: /http:\/\/purl\.obolibrary\.org\/obo\/PATO_.+/,
    getExternalUrl(uri) {
      return "https://ontobee.org/ontology/PATO?iri=" + encodeURIComponent(uri);
    }
  },
  {
    name: "Cell Line Ontology",
    pattern: /http:\/\/purl\.obolibrary\.org\/obo\/CLO_.+/,
    getExternalUrl(uri) {
      return "https://ontobee.org/ontology/CLO?iri=" + encodeURIComponent(uri);
    }
  },
  {
    name: "Mondo Disease Ontology",
    pattern: /http:\/\/purl\.obolibrary\.org\/obo\/MONDO_.+/,
    getExternalUrl(uri) {
      return "https://www.ebi.ac.uk/ols/ontologies/mondo/terms?iri=" + encodeURIComponent(uri);
    }
  },
  {
    name: "ChEBI",
    pattern: /http:\/\/purl\.obolibrary\.org\/obo\/CHEBI_.+/,
    getExternalUrl(uri) {
      return uri.replace("http://purl.obolibrary.org/obo/CHEBI_", "https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:");
    }
  },
  {
    name: "Human Ancestry Ontology",
    pattern: /http:\/\/purl\.obolibrary\.org\/obo\/HANCESTRO_.+/,
    getExternalUrl(uri) {
      return "https://ontobee.org/ontology/HANCESTRO?iri=" + encodeURIComponent(uri);
    }
  },
  {
    name: "NCBI Gene",
    pattern: /http:\/\/purl.org\/commons\/record\/ncbi_gene\/.+/,
    getExternalUrl(uri) {
      return uri.replace("http://purl.org/commons/record/ncbi_gene/", "https://www.ncbi.nlm.nih.gov/gene/");
    }
  },
  {
    name: "Uberon",
    pattern: /http:\/\/purl\.obolibrary\.org\/obo\/UBERON_.+/,
    getExternalUrl(uri) {
      return "https://www.ebi.ac.uk/ols/ontologies/uberon/terms?iri=" + encodeURIComponent(uri);
    }
  },
  {
    name: "Cell Ontology",
    pattern: /http:\/\/purl\.obolibrary\.org\/obo\/CL_.+/,
    getExternalUrl(uri) {
      return "https://www.ebi.ac.uk/ols/ontologies/cl/terms?iri=" + encodeURIComponent(uri);
    }
  },
  {
    name: "Gene Ontology",
    pattern: /http:\/\/purl\.obolibrary\.org\/obo\/GO_.+/,
    getExternalUrl(uri) {
      return uri.replace("http://purl.obolibrary.org/obo/GO_", "https://amigo.geneontology.org/amigo/term/GO:");
    }
  }
];
/**
 * Make highlight labels human-readable from dictionary and also generate key/values for publication highlights from publication fields and publication prefixes.
 *
 * Use pattern to match a term URI and getExternalUrl() to produce a link to the external ontology browser.
 */
let PUBLICATION_FIELDS = {
  "name": "name",
  "abstractText": "abstract text",
  "authorList": "author lists",
  "chemicals.name": "chemicals name",
  "chemicals.registryNumber": "chemicals registry number",
  "fullTextUri": "full text URI",
  "keywords.term": "keywords",
  "meshTerms.term": "mesh terms",
  "pubAccession.accession": "accession",
  "title": "title"
};

export let HIGHLIGHT_LABELS = {
  "shortName": "short name",
  "bioAssays.name": "sample name",
  "bioAssays.description": "sample description",
  "bioAssays.accession.accession": "sample accession",
  "bioAssays.sampleUsed.name": "sample name",
  "bioAssays.sampleUsed.characteristics.value": "sample annotation",
  "bioAssays.sampleUsed.characteristics.valueUri": "sample annotation URI",
  "characteristics.value": "annotation",
  "characteristics.valueUri": "annotation URI",
  "experimentalDesign.name": "experimental design name",
  "experimentalDesign.description": "experimental design description",
  "experimentalDesign.experimentalFactors.name": "experimental factors name",
  "experimentalDesign.experimentalFactors.description": "experimental factors description",
  "experimentalDesign.experimentalFactors.category.categoryUri": "experimental factors category URI",
  "experimentalDesign.experimentalFactors.category.category": "experimental factors category",
  "experimentalDesign.experimentalFactors.factorValues.characteristics.value": "experimental factors annotation",
  "experimentalDesign.experimentalFactors.factorValues.characteristics.valueUri": "experimental factors annotation URI",
  ...Object.fromEntries(Object.entries(PUBLICATION_FIELDS).map(([k, v]) => ["primaryPublication." + k, "primary publication " + v])),
  ...Object.fromEntries(Object.entries(PUBLICATION_FIELDS).map(([k, v]) => ["otherRelevantPublications." + k, "other publication " + v]))
};


