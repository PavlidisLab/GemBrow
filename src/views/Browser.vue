<template>
    <v-layout>
        <v-navigation-drawer v-model="drawer" app width="400">
            <SearchSettings v-model="searchSettings"
                            class="py-3 px-3"
                            :taxon-disabled="loadingTaxa"
                            :annotation-disabled="loadingAnnotation"
                            :annotation-loading="loadingAnnotation"
                            :taxa-disabled="loadingTaxa"
                            :taxa-loading="loadingTaxa"
                            :platform-disabled="loadingPlatforms"
                            :platform-loading="loadingPlatforms"
                            :technology-types="technologyTypes"
                            :taxon="taxon"
                            :platforms="datasetsPlatforms"
                            :annotations="datasetsAnnotations"
                            :total-number-of-expression-experiments="totalNumberOfExpressionExperiments">
                <template v-slot:deactivator>
                    <v-btn icon @click="drawer = false">
                        <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                </template>
            </SearchSettings>
        </v-navigation-drawer>
        <v-main>
            <Error v-for="(error, key) in errors" :key="key" :error="error"/>
            <v-data-table
                    loading-text="We're working hard on your query..."
                    no-data-text="No datasets matched the query and filters."
                    :loading="loadingDatasets"
                    :headers="headers"
                    :items="datasets"
                    :options.sync="options"
                    :server-items-length="totalNumberOfExpressionExperiments"
                    :footer-props="footerProps"
                    show-expand
                    fixed-header
                    dense class="browser-data-table"
            >
                <template v-slot:item.shortName="{item}">
                    <a :href="getUrl(item)">
                        {{ item.shortName }}
                    </a>
                </template>
                <template v-slot:item.resultObject="{item}">
                    <span>{{ item }}</span>
                </template>
                <template v-slot:item.name="{item}">
                    <span v-html="getName(item)"/>
                    <br v-if="hasHighlight(item)"/>
                    <small v-if="hasHighlight(item)"
                           v-html="getHighlight(item)">
                    </small>
                </template>
                <template v-slot:item.lastUpdated="{item}">
                    {{ new Date(item.lastUpdated).toLocaleDateString() }}
                </template>
                <template v-slot:item.taxon="{item}">
                    <span v-text="item.taxon.commonName" class="text-capitalize"/>
                </template>
                <template v-slot:item.bioAssays.size="{item}">
                    <span v-text="item.numberOfBioAssays"/>
                </template>
                <template v-slot:item.searchResult.score="{item}">
                    {{ formatDecimal(item.searchResult?.score) }}
                </template>
                <template v-slot:expanded-item="{item}">
                    <td :colspan="headers.length + 1">
                        <DatasetPreview :dataset="item"></DatasetPreview>
                    </td>
                </template>
                <template v-slot:footer.prepend>
                    <v-btn v-show="!drawer" icon @click="drawer = true">
                        <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                    <div v-show="searchSettings.query">
                        Displaying {{ formatNumber(totalNumberOfExpressionExperiments) }} search results
                    </div>
                    <v-spacer/>
                    <v-progress-circular v-show="downloadProgress !== null" :value="100 * downloadProgress" icon
                                         class="mr-3">
                        <span style="font-size: .6rem">{{ formatPercent(downloadProgress) }}</span>
                    </v-progress-circular>
                    <DownloadButton v-show="totalNumberOfExpressionExperiments > 0"
                                    :browsing-options="browsingOptions"
                                    :filter-description="filterDescription"
                                    :total-number-of-expression-experiments="totalNumberOfExpressionExperiments"
                                    :max-datasets="100"
                                    :progress.sync="downloadProgress"
                                    class="mr-3"/>
                </template>
            </v-data-table>
        </v-main>
    </v-layout>
</template>

<script>
import SearchSettings from "@/components/SearchSettings";
import { ExpressionExperimentType, SearchSettings as SearchSettingsModel } from "@/models";
import { baseUrl, excludedCategories, excludedTerms, marked, HIGHLIGHT_LABELS } from "@/config/gemma";
import { chain, debounce, escapeRegExp, isEqual, sumBy } from "lodash";
import DatasetPreview from "@/components/DatasetPreview.vue";
import { highlight } from "@/search-utils";
import DownloadButton from "@/components/DownloadButton.vue";
import {
  compressArg,
  compressFilter,
  formatDecimal,
  formatNumber,
  formatPercent,
  getCategoryId,
  getTermId,
  pluralize
} from "@/utils";
import Error from "@/components/Error.vue";
import { mapMutations, mapState } from "vuex";

const MAX_URIS_IN_CLAUSE = 200;
const MAX_TERMS_PER_CATEGORY = 200;
const MAX_PLATFORMS = 200;

function quoteIfNecessary(s) {
  if (s.match(/[(), "]/) || s.length === 0) {
    return "\"" + s.replaceAll("\"", "\\") + "\"";
  } else {
    return s;
  }
}

export default {
  name: "Browser",
  components: { Error, DownloadButton, SearchSettings, DatasetPreview },
  props: {
    /**
     * Initial query
     */
    query: String
  },
  data() {
    return {
      drawer: true,
      searchSettings: new SearchSettingsModel(this.query, [ExpressionExperimentType]),
      options: {
        page: 1,
        itemsPerPage: 25,
        sortBy: ["id"],
        sortDesc: [true]
      },
      downloadProgress: null
    };
  },
  computed: {
    title() {
      if (this.totalNumberOfExpressionExperiments > 0) {
        return `Showing ${formatNumber(this.totalNumberOfExpressionExperiments)} results`;
      } else {
        return null;
      }
    },
    headers() {
      let h = [];
      h.push(
        {
          text: "Short name",
          value: "shortName"
        }
      );
      if (this.searchSettings.taxon.length !== 1) {
        h.push(
          {
            text: "Taxon",
            value: "taxon"
          }
        );
      }
      h.push(
        {
          text: "Title",
          value: "name"
        },
        {
          text: "Number of Samples",
          value: "bioAssays.size",
          align: "center"
        },
        {
          text: "Last Updated",
          value: "lastUpdated"
        }
      );
      if (this.debug && this.appliedQuery) {
        h.push({
          text: "Score (dev only)",
          value: "searchResult.score",
          align: "center",
          sortable: false
        });
      }
      return h;
    },
    filter() {
      let filter = [];
      if (this.searchSettings.taxon.length === 1) {
        filter.push(["taxon.id = " + this.searchSettings.taxon[0].id]);
      } else if (this.searchSettings.taxon.length > 0) {
        filter.push(["taxon.id in (" + this.searchSettings.taxon.map(t => t.id).join(",") + ")"]);
      }
      if (this.searchSettings.platforms.length > 0 || this.searchSettings.technologyTypes.length > 0) {
        let platformIds = this.searchSettings.platforms.map(p => p.id);
        let clause = [];
        if (this.searchSettings.platforms.length > 0) {
          clause.push("bioAssays.arrayDesignUsed.id in (" + platformIds.join(",") + ")");
          clause.push("bioAssays.originalPlatform.id in (" + platformIds.join(",") + ")");
        }
        if (this.searchSettings.technologyTypes.length > 0) {
          let technologyTypes = this.searchSettings.technologyTypes.filter(t => t !== "RNASEQ");
          // special case if searching exclusively for RNA-Seq
          if (this.searchSettings.technologyTypes.includes("RNASEQ")) {
            // if searching exclusively for RNA-Seq data, we can add an extra filter for correctness
            // only microarray platforms can be selected individually
            if (this.searchSettings.technologyTypes.length === 1 && this.searchSettings.platforms.length === 0) {
              filter.push(["bioAssays.originalPlatform.technologyType = SEQUENCING"]);
            }
            technologyTypes.push("GENELIST");
          }
        clause.push(
          "bioAssays.arrayDesignUsed.technologyType in (" + technologyTypes.join(",") + ")"
        );
      }
      filter.push(clause);
      }
      
      if (this.searchSettings.categories.length > 0) {
        // check if all categories are picked
        let categories = this.searchSettings.categories;
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
      if (this.searchSettings.annotations.length > 0) {
        let annotationByCategoryId = chain(this.searchSettings.annotations)
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
            .filter(t => t.termName === null)
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
    },
    browsingOptions() {
      // query can be null if reset
      if (this.searchSettings.query && this.searchSettings.query.length > 0) {
        return {
          query: this.searchSettings.query,
          filter: this.filter,
          sort: this.options.sortBy[0] && (this.options.sortDesc[0] ? "-" : "+") + this.options.sortBy[0],
          offset: (this.options.page - 1) * this.options.itemsPerPage,
          limit: this.options.itemsPerPage,
          ignoreExcludedTerms: !!this.searchSettings.ignoreExcludedTerms
        };
      } else {
        return {
          filter: this.filter,
          sort: this.options.sortBy[0] && (this.options.sortDesc[0] ? "-" : "+") + this.options.sortBy[0],
          offset: (this.options.page - 1) * this.options.itemsPerPage,
          limit: this.options.itemsPerPage,
          ignoreExcludedTerms: !!this.searchSettings.ignoreExcludedTerms
        };
      }
    },
    ...mapState({
      debug: state => state.debug,
      errors(state) {
        if (state.lastError) {
          return [state.lastError];
        } else {
          return Object.entries(state.api.error).flatMap(([key, error]) => key === "datasetsAnnotationsByCategory" ? Object.values(error) : [error])
            .filter(e => e !== null)
            .map(e => e.response?.data?.error || e)
            .slice(0, 1);
        }
      },
      datasets: state => state.api.datasets?.data || [],
      /**
       * Currently applied query.
       * @param state
       * @returns {*}
       */
      appliedQuery(state) {
        return state.api.datasets?.query;
      },
      totalNumberOfExpressionExperiments: state => state.api.datasets?.totalElements || 0,
      footerProps: state => {
        if (state.api.datasets === undefined) {
          return {};
        }
        return {
          pagination: {
            page: Math.ceil(state.api.datasets.offset / state.api.datasets.limit),
            itemsPerPage: state.api.datasets.limit,
            pageStart: state.api.datasets.offset,
            pageStop: state.api.datasets.offset + state.api.datasets.limit,
            pageCount: Math.ceil(state.api.datasets.totalElements / state.api.datasets.limit),
            itemsLength: formatNumber(state.api.datasets.totalElements)
          },
          disablePagination: state.api.pending.datasets,
          disableItemsPerPage: state.api.pending.datasets,
          showCurrentPage: true,
          showFirstLastPage: true,
          itemsPerPageOptions: [25, 50, 100]
        };
      },
      technologyTypes(state) {
        // FIXME: I don't understand how state.api.openApiSpecification
        if (state.api.openApiSpecification !== undefined && state.api.openApiSpecification.components !== undefined) {
          const filterableProperties = state.api.openApiSpecification.components.schemas["FilterArgExpressionExperiment"]["x-gemma-filterable-properties"];
          const technologyTypes = filterableProperties.find(prop => prop.name === "bioAssays.arrayDesignUsed.technologyType");
          return technologyTypes["allowedValues"].map(elem => {
            return { id: elem.value, label: elem.label };
          });
        } else {
          return [];
        }
      },
      loadingDatasets: state => !!state.api.pending["datasets"],
      loadingPlatforms: state => !!state.api.pending["datasetsPlatforms"],
      loadingAnnotation: state => !!state.api.pending["datasetsCategories"] || !!Object.values(state.api.pending["datasetsAnnotationsByCategory"]).some(x => x),
      loadingTaxa: state => !!state.api.pending["datasetsTaxa"],
      datasetsPlatforms: state => state.api.datasetsPlatforms?.data || [],
      datasetsTaxa: state => state.api.datasetsTaxa?.data || [],
      taxon: state => state.api.datasetsTaxa?.data || [],
      datasetsAnnotations(state) {
        return (state.api.datasetsCategories?.data || [])
          .map(category => {
            return {
              classUri: category.classUri,
              className: category.className,
              children: state.api.datasetsAnnotationsByCategory[getCategoryId(category)]?.data || [],
              numberOfExpressionExperiments: category.numberOfExpressionExperiments
            };
          })
          // exclude categories with no selectable terms
          // categories are not retrieved with all the filters
          .filter(c => c.children.length > 0);
      },
      myself(state) {
        if (state.api.myself === undefined) {
          return null;
        }
        return state.api.myself.code === 401 ? null : state.api.myself.data;
      }
    }),
    filterSummary() {
      const filters = [];
      if (this.searchSettings.query) {
        filters.push("query");
      }
      if (this.searchSettings.taxon.length > 0) {
        filters.push("taxa");
      }
      if (this.searchSettings.platforms.length > 0 || this.searchSettings.technologyTypes.length > 0) {
        filters.push("platforms");
      }
      if (this.searchSettings.categories.length > 0 || this.searchSettings.annotations.length > 0) {
        filters.push("annotations");
      }
      if (filters.length > 0) {
        return "Filters applied: " + filters.join(", ");
      } else {
        return "";
      }
    },
    filterDescription() {
      const filter = [];
      if (this.searchSettings.query) {
        filter.push({ key: "Query ", value: `"${this.searchSettings.query}"` });
      }
      if (this.searchSettings.taxon.length > 0) {
        const taxaValues = this.searchSettings.taxon.map(taxon => taxon.commonName);
        filter.push({ key: "Taxa ", value: taxaValues.join(" OR ") });
      }
      if (this.searchSettings.platforms.length > 0 || this.searchSettings.technologyTypes.length > 0) {
        const platformValues = this.searchSettings.platforms.map(platforms => platforms.name);
        if (this.searchSettings.technologyTypes && this.searchSettings.technologyTypes.includes('RNASEQ')) {
          platformValues.unshift('RNA-Seq')
        }
        if (this.searchSettings.technologyTypes && this.searchSettings.technologyTypes.length >= 3 && this.searchSettings.platforms.length === 0) {
          platformValues.unshift('Microarray')
        }
        filter.push({ key: "Platforms ", value: platformValues });
      }
      if (this.searchSettings.categories.length > 0) {
        for (let cat of this.searchSettings.categories) {
          if (cat.className) {
            filter.push({ key: pluralize(cat.className), value: "ANY" });
          } else if (cat.classUri) {
            filter.push({ key: cat.classUri, value: "ANY" });
          } else {
            filter.push({ key: "Uncategorized", value: "ANY" });
          }
        }
      }
      if (this.searchSettings.annotations.length > 0) {
        const annotationGroups = this.searchSettings.annotations.reduce((acc, annotation) => {
          let { classUri, className, termName } = annotation;
          if (className) {
            className = pluralize(className);
          } else if (classUri) {
            className = classUri;
          } else {
            className = "Uncategorized";
          }
          if (!acc[className]) {
            acc[className + ' '] = [termName];
          } else {
            acc[className].push(termName);
          }
          return acc;
        }, {});
        for (const className in annotationGroups) {
          filter.push({ key: className, value: annotationGroups[className] });
        }
      }
      if (filter.length > 0) {
        const description = filter.map(filter => {
          const { key, value } = filter;
          const capitalizedKey = this.capitalizeFirstLetter(key);

          if (Array.isArray(value)) {
            const capitalizedValues = value.map(this.capitalizeFirstLetter);
            return `${capitalizedKey}= ${capitalizedValues.join(" OR ")}`;
          } else {
            const capitalizedValue = this.capitalizeFirstLetter(value);
            return `${capitalizedKey}= ${capitalizedValue}`;
          }
        }).join("\n AND \n");
        return description;
      } else {
        return "";
      }
    }
  },
  methods: {
    formatDecimal,
    formatNumber,
    formatPercent,
    /**
     * Basically a browse with a debounce when the user is actively typing a query.
     * @return {Promise|undefined} initially undefined, then a promise once the function has been invoked at least once
     */
    search: debounce(function(browsingOptions) {
      return this.browse(browsingOptions, true).then(() => {
        let location = browsingOptions.query ? "/q/" + encodeURIComponent(browsingOptions.query) : "/";
        // because this is debounced, it's possible that two consecutive searches are performed with the same query
        // i.e. user types "brain" and obtain results, then deletes one char "brai" and add one char back to "brain"
        // in less than 1s
        if (location !== this.$router.currentRoute.fullPath) {
          return this.$router.push(location);
        }
      }).catch(err => {
        // because the function is debounced, the caller might never get resulting promise and ability to handle the error
        console.error("Error while searching: " + err.message + ".", err);
        this.setLastError(err);
      });
    }, 1000),
    browse(browsingOptions, updateEverything) {
      // update available annotations and number of datasets
      let updateDatasetsPromise = this.updateDatasets(browsingOptions.query, browsingOptions.filter, browsingOptions.offset, browsingOptions.limit, browsingOptions.sort);
      if (updateEverything) {
        // since the query or filters have changed, reset the browsing offset to the beginning
        browsingOptions.offset = 0;
        this.options.page = 1;
        let updateDatasetsAnnotationsPromise;
        if (browsingOptions.ignoreExcludedTerms) {
          updateDatasetsAnnotationsPromise = this.updateAvailableCategories(browsingOptions.query, browsingOptions.filter);
        } else {
          updateDatasetsAnnotationsPromise = Promise.all([compressArg(excludedCategories.join(",")), compressArg(excludedTerms.join(","))])
            .then(([excludedCategories, excludedTerms]) => this.updateAvailableCategories(browsingOptions.query, browsingOptions.filter, excludedCategories, excludedTerms));
        }
        let updateDatasetsPlatformsPromise = this.updateAvailablePlatforms(browsingOptions.query, browsingOptions.filter);
        let updateDatasetsTaxaPromise = this.updateAvailableTaxa(browsingOptions.query, browsingOptions.filter);
        return Promise.all([updateDatasetsPromise, updateDatasetsAnnotationsPromise, updateDatasetsPlatformsPromise, updateDatasetsTaxaPromise]);
      } else {
        return updateDatasetsPromise;
      }
    },
    updateDatasets(query, filter, offset, limit, sort) {
      return compressFilter(filter).then((compressedFilter) => {
        let payload = { query: query, filter: compressedFilter, offset: offset, limit: limit, sort: sort };
        if (query !== undefined) {
          payload["query"] = query;
        }
        if (this.myself) {
          payload["gid"] = this.myself.group;
        }
        return this.$store.dispatch("api/getDatasets", {
          params: payload
        });
      });
    },
    /**
     * Update available categories.
     */
    updateAvailableCategories(query, filter, excludedCategories, excludedTerms) {
      let disallowedPrefixes = [
        "allCharacteristics.",
        "characteristics.",
        "bioAssays.sampleUsed.characteristics.",
        "experimentalDesign.experimentalFactors.factorValues.characteristics."
      ];
      let mFilter = filter;
      if (mFilter) {
        mFilter = mFilter.map(clause => clause
          .filter(subClause => !disallowedPrefixes.some(p => subClause.startsWith(p))))
          .filter(clause => clause.length > 0);
      }
      return compressFilter(mFilter).then(compressedFilter => {
        let payload = {
          filter: compressedFilter
        };
        if (query !== undefined) {
          payload["query"] = query;
        }
        if (excludedCategories !== undefined) {
          payload["excludedCategories"] = excludedCategories;
        }
        if (excludedTerms !== undefined) {
          payload["excludedTerms"] = excludedTerms;
        }
        if (this.myself) {
          payload["gid"] = this.myself.group;
        }
        // proactively query categories we already know about, otherwise we have to wait until the
        // getDatasetsCategories() endpoint finishes
        let categories = this.datasetsAnnotations.map(getCategoryId);
        for (let categoryId of categories) {
          this.updateAvailableAnnotationsByCategory(categoryId, query, filter, excludedTerms);
        }
        return this.$store.dispatch("api/getDatasetsCategories", { params: payload })
          .then(data => {
            return Promise.all([...categories, ...data.data.data.map(category => {
              let categoryId = getCategoryId(category);
              if (!categories.includes(categoryId)) {
                return this.updateAvailableAnnotationsByCategory(categoryId, query, filter, excludedTerms);
              }
            })]);
          });
      });
    },
    /**
     * Update available annotations for a specific category.
     *
     * To get accurate counts, we have to exclude all the clauses involving terms from the category. This is a bit
     * tricky because at this point the filter is already generated, so we remove clauses matching a regex constructed
     * by concatenating all the terms in the category.
     */
    updateAvailableAnnotationsByCategory(category, query, filter, excludedTerms) {
      // generate a regex to match clauses we want to exclude
      let annotationsToExclude = this.datasetsAnnotations
        .filter(t => getCategoryId(t) === category)
        .flatMap(c => c.children)
        .map(getTermId);
      if (annotationsToExclude.length > 0) {
        let annotationsToExcludeR = new RegExp(annotationsToExclude.map(escapeRegExp).join("|"));
        filter = filter
          .map(clause => clause.filter(subClause => !annotationsToExcludeR.test(subClause)))
          .filter(clause => clause.length > 0);
      }
      // exclude filters for the category
      return compressFilter(filter)
        .then(compressedFilter => {
          let payload = {
            category: category,
            filter: compressedFilter,
            limit: MAX_TERMS_PER_CATEGORY,
            exclude: ["parentTerms"],
            // ensures that the terms appearing in filter are always returned
            retainMentionedTerms: true
          };
          if (query) {
            payload["query"] = query;
          }
          if (excludedTerms !== undefined) {
            payload["excludedTerms"] = excludedTerms;
          }
          if (this.myself) {
            payload["gid"] = this.myself.group;
          }
          return this.$store.dispatch("api/getDatasetsAnnotationsByCategory", { params: payload });
        });
    },
    updateOpenApiSpecification() {
      return this.$store.dispatch("api/getOpenApiSpecification");
    },
    updateAvailableTaxa(query, filter) {
      // remove any clauses involving taxon
      if (filter) {
        filter = filter.map(clause => clause.filter(subClause => !subClause.startsWith("taxon."))).filter(clause => clause.length > 0);
      }
      return compressFilter(filter).then(compressedFilter => {
        let payload = { filter: compressedFilter };
        if (query) {
          payload["query"] = query;
        }
        if (this.myself) {
          payload["gid"] = this.myself.group;
        }
        return this.$store.dispatch("api/getDatasetsTaxa", { params: payload });
      });
    },
    updateAvailablePlatforms(query, filter) {
      // remove any clauses involving platforms
      if (filter) {
        filter = filter.map(clause => clause.filter(subClause => !subClause.startsWith("bioAssays.arrayDesignUsed.") && !subClause.startsWith("bioAssays.originalPlatform."))).filter(clause => clause.length > 0);
      }
      return compressFilter(filter).then(compressedFilter => {
        let payload = {
          filter: compressedFilter,
          limit: MAX_PLATFORMS
        };
        if (query) {
          payload["query"] = query;
        }
        if (this.myself) {
          payload["gid"] = this.myself.group;
        }
        return this.$store.dispatch("api/getDatasetsPlatforms", { params: payload });
      });
    },
    hasHighlight(item) {
      return item.searchResult !== undefined && item.searchResult.highlights !== null;
    },
    getHighlight(item) {
      return Object.entries(item.searchResult.highlights)
        .filter(h => h[0] !== "name") // the name is highlighted in the table
        .map(h => marked.parseInline("Tagged " + (HIGHLIGHT_LABELS[h[0]] || h[0]) + ": " + h[1]))
        .join("<br/>");
    },
    getName(item) {
      if (this.hasHighlight(item) && "name" in item.searchResult.highlights) {
        return highlight(item.name, item.searchResult.highlights.name);
      } else {
        return item.name;
      }
    },
    getUrl(item) {
      return baseUrl + "/expressionExperiment/showExpressionExperiment.html?id=" + encodeURIComponent(item.id);
    },
    capitalizeFirstLetter(str) {
      return str
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
    ...mapMutations(["setTitle", "setFilterSummary", "setFilterDescription", "setLastError"])
  },
  created() {
    let query = this.searchSettings.query;
    let filter = this.filter;
    return Promise.all([compressArg(excludedCategories.join(",")), compressArg(excludedTerms.join(","))])
      .then(([excludedCategories, excludedTerms]) => {
        return Promise.all([
          this.updateOpenApiSpecification(),
          this.updateAvailableTaxa(query, filter),
          this.updateAvailablePlatforms(query, filter),
          this.updateAvailableCategories(query, filter, excludedCategories, excludedTerms),
          this.browse(this.browsingOptions)])
          .catch(err => console.error(`Error while loading initial data: ${err.message}.`, err));
      });
  },
  watch: {
    title(newVal) {
      this.setTitle(newVal);
    },
    query: function(newVal) {
      this.searchSettings.query = newVal !== undefined ? newVal : null;
    },
    filterSummary: function(newVal) {
      this.setFilterSummary(newVal);
    },
    filterDescription: function(newVal) {
      this.setFilterDescription(newVal);
    },
    "browsingOptions": function(newVal, oldVal) {
      let promise;
      if (oldVal !== undefined && (oldVal.query !== newVal.query || !isEqual(oldVal.filter, newVal.filter) || oldVal.ignoreExcludedTerms !== newVal.ignoreExcludedTerms)) {
        // query has changed, debounce
        if (oldVal.query !== newVal.query) {
          promise = this.search(newVal) || Promise.resolve();
        } else if (!isEqual(oldVal.filter, newVal.filter)) {
          promise = this.browse(newVal, true);
        } else if (oldVal.ignoreExcludedTerms !== newVal.ignoreExcludedTerms) {
          if (newVal.ignoreExcludedTerms) {
            promise = this.updateAvailableCategories(newVal.query, newVal.filter);
          } else {
            promise = Promise.all([compressArg(excludedCategories.join(",")), compressArg(excludedTerms.join(","))])
              .then(([excludedCategories, excludedTerms]) => this.updateAvailableCategories(newVal.query, newVal.filter, excludedCategories, excludedTerms));
          }
        } else {
          promise = Promise.resolve();
        }
      } else {
        // filter and query are unchanged, we don't need to update everything
        promise = this.browse(newVal, false);
      }
      promise.catch(err => {
        console.error("Error while updating datasets after browsing options changed: " + err.message + ".", err);
      });
    },
    myself: function(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.browse(this.browsingOptions, true)
          .catch(err => {
            console.error("Error while updating datasets after logged user changed: " + err.message + ".", err);
            this.setLastError(err);
          });
      }
    }
  }
};
</script>

<style scoped>
.browser-data-table >>> .v-data-table__wrapper {
    margin-bottom: 59px;
    max-height: 100%;
}

.browser-data-table >>> .v-data-table-header th {
    white-space: nowrap;
}

.browser-data-table >>> .v-data-footer {
    background: white;
    position: fixed;
    width: 100%;
    bottom: 0;
    right: 0;
    margin-right: 0 !important;
}
</style>