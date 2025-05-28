const MICROARRAY_TECHNOLOGY_TYPES = ["ONECOLOR", "TWOCOLOR", "DUALMODE"];
const RNA_SEQ_TECHNOLOGY_TYPES = ["SEQUENCING"];
const OTHER_TECHNOLOGY_TYPES = ["GENELIST", "OTHER"];
const TECHNOLOGY_TYPES = MICROARRAY_TECHNOLOGY_TYPES + RNA_SEQ_TECHNOLOGY_TYPES + OTHER_TECHNOLOGY_TYPES;
const TOP_TECHNOLOGY_TYPES = [
  ["RNA_SEQ", "RNA-Seq", RNA_SEQ_TECHNOLOGY_TYPES],
  ["MICROARRAY", "Microarray", MICROARRAY_TECHNOLOGY_TYPES],
  ["OTHER", "Other", OTHER_TECHNOLOGY_TYPES]];

const TECH_ADDITIONS = {
  "http://purl.obolibrary.org/obo/OBI_0000070":{
    "http://www.ebi.ac.uk/efo/EFO_0008913":{ //single cell
      "parent":"SEQUENCING"
    },
    "http://www.ebi.ac.uk/efo/EFO_0009809":{ // single nucleus
      "parent":"SEQUENCING"
    },
    "http://purl.obolibrary.org/obo/OBI_0003109":{ // single nucleus
      "parent":"SEQUENCING"
    },
    "http://purl.obolibrary.org/obo/OBI_0002631":{ // single cell
      "parent":"SEQUENCING"
    }
  }
}

export {MICROARRAY_TECHNOLOGY_TYPES, RNA_SEQ_TECHNOLOGY_TYPES, OTHER_TECHNOLOGY_TYPES, TECHNOLOGY_TYPES, TOP_TECHNOLOGY_TYPES,TECH_ADDITIONS}