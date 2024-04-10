import { SearchSettings } from "@/lib/models";
import { chain, sumBy } from "lodash";
import { getCategoryId, pluralize } from "@/lib/utils";

const MAX_URIS_IN_CLAUSE = 200;

export function capitalizeFirstLetter(str) {
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function quoteIfNecessary(s) {
  if (s.match(/[(), "]/) || s.length === 0) {
    return "\"" + s.replaceAll("\"", "\\") + "\"";
  } else {
    return s;
  }
}

/**
 * Generate a filter from a search settings model.
 * @param {SearchSettings} searchSettings
 * @return {Array<Array<String>>}
 */
export function generateFilter(searchSettings) {
  let filter = [];
  if (searchSettings.taxon.length === 1) {
    filter.push(["taxon.id = " + searchSettings.taxon[0].id]);
  } else if (searchSettings.taxon.length > 0) {
    filter.push(["taxon.id in (" + searchSettings.taxon.map(t => t.id).join(",") + ")"]);
  }
  if (searchSettings.platforms.length > 0 || searchSettings.technologyTypes.length > 0) {
    let platformIds = searchSettings.platforms.map(p => p.id);
    let clause = [];
    if (searchSettings.platforms.length > 0) {
      clause.push("bioAssays.arrayDesignUsed.id in (" + platformIds.join(",") + ")");
      clause.push("bioAssays.originalPlatform.id in (" + platformIds.join(",") + ")");
    }
    if (searchSettings.technologyTypes.length > 0) {
      clause.push("bioAssays.originalPlatform.technologyType in (" + searchSettings.technologyTypes.join(",") + ")");
      clause.push("bioAssays.arrayDesignUsed.technologyType in (" + searchSettings.technologyTypes.join(",") + ")");
    }
    filter.push(clause);
  }

  if (searchSettings.categories.length > 0) {
    // check if all categories are picked
    let categories = searchSettings.categories;
    if (categories.length > MAX_URIS_IN_CLAUSE) {
      console.warn(`Too many categories (${categories.length}) in clause, will only retain the first ${MAX_URIS_IN_CLAUSE} categories.`);
      categories = categories.slice(0, MAX_URIS_IN_CLAUSE);
    }
    if (categories.length > 0) {
      for (const category of categories) {
        if (category.classUri) {
          filter.push(["allCharacteristics.categoryUri = " + quoteIfNecessary(category.classUri)]);
        } else if (category.className) {
          filter.push(["allCharacteristics.category = " + quoteIfNecessary(category.className)]);
        } else {
          console.warn("Selection of the 'Uncategorized' category is not supported");
        }
      }
    }
  }
  if (searchSettings.annotations.length > 0) {
    let annotationByCategoryId = chain(searchSettings.annotations)
      .groupBy(getCategoryId)
      .value();
    for (const categoryId in annotationByCategoryId) {
      let categoryUri = annotationByCategoryId[categoryId].find(t => t.classUri !== null)?.classUri || null;
      let categoryName = annotationByCategoryId[categoryId].find(t => t.classUri === null)?.className || null;
      // FIXME: the category should be in a conjunction with the value, but that is not supported
      // add a clause for the category, this is not exactly correct
      if (categoryUri !== null) {
        filter.push(["allCharacteristics.categoryUri = " + quoteIfNecessary(categoryId)]);
      } else if (categoryName !== null) {
        filter.push(["allCharacteristics.category = " + quoteIfNecessary(categoryId)]);
      } else {
        console.warn("Selection of the 'Uncategorized' category is not supported.");
      }
      let termUris = annotationByCategoryId[categoryId]
        .filter(t => t.termUri !== null)
        .map(t => t.termUri);
      let termNames = annotationByCategoryId[categoryId]
        .filter(t => t.termUri === null)
        .map(t => t.termName);
      let f = [];
      if (termUris.length > MAX_URIS_IN_CLAUSE) {
        console.warn(`Too many annotations (${termUris.length}) selected under ${categoryId}, will only retain the first ${MAX_URIS_IN_CLAUSE} terms.`);
        termUris = termUris.slice(0, MAX_URIS_IN_CLAUSE);
      }
      if (termUris.length > 0) {
        f.push("allCharacteristics.valueUri in (" + termUris.map(quoteIfNecessary).join(", ") + ")");
      }
      if (termNames.length > MAX_URIS_IN_CLAUSE) {
        console.warn(`Too many annotations (${termNames.length}) selected under ${categoryId}, will only retain the first${MAX_URIS_IN_CLAUSE} terms.`);
        termNames = termNames.slice(0, MAX_URIS_IN_CLAUSE);
      }
      if (termNames.length > 0) {
        f.push("allCharacteristics.value in (" + termNames.map(quoteIfNecessary).join(", ") + ")");
      }
      filter.push(f);
    }
  }
  let numberOfClauses = sumBy(filter, f => f.length);
  if (numberOfClauses > 100) {
    console.error("Too many clauses (" + numberOfClauses + ") in filter.");
    return [];
  }
  return filter;
}

/**
 * Generate a human-readable description for a search settings.
 * @param {SearchSettings} searchSettings
 * @returns {String}
 */
export function generateFilterSummary(searchSettings) {
  const filters = [];
  if (searchSettings.query) {
    filters.push("query");
  }
  if (searchSettings.taxon.length > 0) {
    filters.push("taxa");
  }
  if (searchSettings.platforms.length > 0 || searchSettings.technologyTypes.length > 0) {
    filters.push("platforms");
  }
  if (searchSettings.categories.length > 0 || searchSettings.annotations.length > 0) {
    filters.push("annotations");
  }
  if (filters.length > 0) {
    return "Filters applied: " + filters.join(", ");
  } else {
    return "";
  }
}

function formatTerm(uri) {
  return new URL(uri).pathname.split("/").pop().replace("_", ":");
}

/**
 * Generate a human-readable description for a search settings.
 * @param {SearchSettings} searchSettings
 * @param {Map<String,Array<String>>} inferredTermsByCategory
 * @returns {String}
 */
export function generateFilterDescription(searchSettings,inferredTermsLabelsByCategory,missingLabelsByCategory) {
  const filter = [];
  if (searchSettings.query) {
    filter.push({ key: "Query", value: `"${searchSettings.query}"` });
  }
  if (searchSettings.taxon.length > 0) {
    const taxaValues = searchSettings.taxon.map(taxon => taxon.commonName);
    filter.push({ key: "Taxa", value: taxaValues.join(" OR ") });
  }
  if (searchSettings.platforms.length > 0 || searchSettings.technologyTypes.length > 0) {
    const platformValues = searchSettings.platforms.map(platforms => platforms.name);
    if (searchSettings.technologyTypes && searchSettings.technologyTypes.includes("RNASEQ")) {
      platformValues.unshift("RNA-Seq");
    }
    if (searchSettings.technologyTypes && searchSettings.technologyTypes.length >= 3 && searchSettings.platforms.length === 0) {
      platformValues.unshift("Microarray");
    }
    filter.push({ key: "Platforms", value: platformValues });
  }
  if (searchSettings.categories.length > 0) {
    for (let cat of searchSettings.categories) {
      if (cat.className) {
        filter.push({ key: pluralize(cat.className), value: "ANY" });
      } else if (cat.classUri) {
        filter.push({ key: cat.classUri, value: "ANY" });
      } else {
        filter.push({ key: "Uncategorized", value: "ANY" });
      }
    }
  }
  if (searchSettings.annotations.length > 0) {
    const annotationGroups = searchSettings.annotations.reduce((acc, annotation) => {
      let { classUri, className, termName, termUri } = annotation;
      if (className) {
        className = capitalizeFirstLetter(pluralize(className));
      } else if (classUri) {
        className = formatTerm(classUri);
      } else {
        className = "Uncategorized";
      }
      if (!acc[className]) {
        acc[className] = [capitalizeFirstLetter(termName)];
      } else {
        acc[className].push(capitalizeFirstLetter(termName));
      }
      // drop the term from inferred annotations
      if (inferredTermsLabelsByCategory[classUri]){
        delete inferredTermsLabelsByCategory[classUri][termUri]
      }
      return acc;
    }, {});
    for (let classUri in inferredTermsLabelsByCategory) {
      const inferredTermsLabels = inferredTermsLabelsByCategory[classUri];
      const missingLabels = missingLabelsByCategory[classUri]
      if (inferredTermsLabels) {
        let className = searchSettings.annotations.filter(a => a.classUri === classUri)[0]?.className;
        if (className) {
          className = capitalizeFirstLetter(pluralize(className));
        } else if (classUri) {
          className = formatTerm(classUri);
        } else {
          className = "Uncategorized";
        }
        if (annotationGroups[className] === undefined) {
          annotationGroups[className] = [];
        }
        // include inferred terms
        const annotations = annotationGroups[className];
        const maxTermsToDisplay = 6 - annotations.length;

        // inferredTermsLabels may have undefined URIs. If there aren't enough
        // ones with labesl to show, use URIs for now
        let with_labels = Object.entries(inferredTermsLabels)
        .filter(([key,value])=> value != undefined)
        .map(([key,value])=>{return capitalizeFirstLetter(value)})
        let retrieved_uris = []
        let retrieved_labels = []
        if (missingLabels != undefined){
          [retrieved_uris ,retrieved_labels] = Object.entries(missingLabels)
          .filter(([key,value])=> value != undefined)
          .reduce((acc, [key,value])=> {
            acc[0] = acc[0].concat(key)
            acc[1] = acc[1].concat(capitalizeFirstLetter(value))
            return acc
          },[[],[]])
        }  
        
        let no_labels =  Object.entries(inferredTermsLabels)
        .filter(([key,value])=> value == undefined && retrieved_uris.indexOf(key) == -1) 
        .map(([key,value])=>{return key})


        if (maxTermsToDisplay > 0) {
          annotations.push(
            ...with_labels.slice(0,maxTermsToDisplay),
            ...retrieved_labels.slice(0,Math.max(maxTermsToDisplay-with_labels.length,0)),
            ...no_labels.slice(0,Math.max(maxTermsToDisplay-with_labels.length -retrieved_labels.length ,0)).map(formatTerm));
        }
        let l = Object.keys(inferredTermsLabels).length
        if (l > maxTermsToDisplay) {
          annotations.push((l - maxTermsToDisplay) + " more terms...");
        }

      }
    }
    for (const className in annotationGroups) {
      filter.push({ key: className, value: annotationGroups[className] });
    }
  }
  return filter.map(({ key, value }) => {
    if (Array.isArray(value)) {
      return `${key}: ${value.join(" OR ")}`;
    } else {
      return `${key}: ${value}`;
    }
  }).join("\n AND \n");
}
