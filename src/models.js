/**
 * TODO: use Swagger's specification for models
 */

/**
 * Represents a Taxon.
 * @param commonName
 * @param scientificName
 * @constructor
 */
export function Taxon(commonName, scientificName) {
  this.commonName = commonName;
  this.scientificName = scientificName;
}

/**
 * Represents a Gemma platform.
 * @param id
 * @constructor
 */
export function Platform(id) {
  this.id = id;
}

/**
 * Represents a Gemma dataset.
 * @param id
 * @constructor
 */
export function Dataset(id) {
  this.id = id;
}

/**
 * Inclusive low-high quality range for GEEQ score filtering.
 * @param low lowest acceptable quality
 * @param high highest acceptable quality
 * @constructor
 */
export function QualityRange(low, high) {
  this.low = low;
  this.high = high;
}

/**
 * Represent search settings for the /search endpoint.
 *
 * @param query {String} query for searching. It is interpreted as a term URI if it begins with http://.
 * @param resultTypes {Array[String]} List of result types to search for.
 * Available values:
 *  - ArrayDesign
 *  - BibliographicReference
 *  - BioSequence
 *  - CompositeSequence
 *  - ExpressionExperiment
 *  - ExpressionExperimentSet
 *  - Gene
 *  - GeneSet
 *  - PhenotypeAssociation
 * @param platform {Platform} Filter results by platform (ArrayDesign) if applicable
 * @param taxon {Taxon} Filter results by taxon if applicable
 * @param quality {QualityRange} Filter results by quality, if applicable
 * @param maxResults {Number} Maximum number of results
 */
export function SearchSettings(query, resultTypes, platform, taxon, quality) {
  this.query = query;
  this.resultTypes = resultTypes || [];
  this.platform = platform;
  this.taxon = taxon;
  this.quality = quality;
  this.technologyTypes = [];
  this.annotations = [];
}

export const ExpressionExperimentType = "ubic.gemma.model.expression.experiment.ExpressionExperiment";
export const ArrayDesignType = "ubic.gemma.model.expression.arrayDesign.ArrayDesign";
export const GeneType = "ubic.gemma.model.genome.Gene";

/**
 * Enumeration of supported result types.
 */
export const SUPPORTED_RESULT_TYPES = [
  { id: ArrayDesignType, title: "Platforms", "enabled": true, order: 2 },
  //  { id: "BibliographicReference", title: "Bibliographic references", "enabled": false },
  //  { id: "BioSequence", title: "Probes", "enabled": false },
  { id: GeneType, title: "Genes", "enabled": false, order: 3 },
  //  { id: "GeneSet", title: "Gene sets", "enabled": false },
  { id: ExpressionExperimentType, title: "Datasets", "enabled": true, order: 1 }
  //  { id: "ExpressionExperimentSet", title: "Datasets groups", "enabled": false },
  //  { id: "PhenotypeAssociation", title: "Phenotypes", "enabled": false }
];

export function SearchResult(resultId, resultType, resultObject, score, source) {
  this.resultId = resultId;
  this.resultType = resultType;
  this.score = score;
  this.source = source;
  this.resultObject = resultObject;
}

/**
 * Represents a collection of search results.
 * @param data {Array[SearchResults]}
 * @param searchSettings {SearchSettings} search settings returned by the API
 * @constructor
 */
export function SearchResults(data, searchSettings) {
  this.data = data || [];
  this.searchSettings = searchSettings;
}