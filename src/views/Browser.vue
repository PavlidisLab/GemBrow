<template>
    <v-layout>
        <v-navigation-drawer app permanent width="400">
            <SearchSettings v-model="searchSettings"
                            class="py-3 px-3"
                            :taxon-disabled="loadingTaxa"
                            :annotation-disabled="loadingAnnotation"
                            :annotation-loading="loadingAnnotation"
                            :platform-disabled="loadingPlatforms"
                            :technology-types="technologyTypes"
                            :taxa="taxa"
                            :platforms="datasetsPlatforms"
                            :annotations="datasetsAnnotations"
                            :total-number-of-expression-experiments="totalNumberOfExpressionExperiments"/>
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
                    dense class="mb-3">
                <template v-slot:item.shortName="{item}">
                    <a :href="baseUrl + '/expressionExperiment/showExpressionExperiment.html?id=' + encodeURIComponent(item.id)">
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
                                    :search-settings="searchSettings"
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
import { mapState } from "vuex";
import { baseUrl, blacklistedTerms, marked } from "@/config/gemma";
import { chain, debounce, groupBy, isEqual, sumBy } from "lodash";
import DatasetPreview from "@/components/DatasetPreview.vue";
import { highlight } from "@/search-utils";
import DownloadButton from "@/components/DownloadButton.vue";
import { compressArg, formatDecimal, formatNumber, formatPercent } from "@/utils";
import Error from "@/components/Error.vue";

const MAX_URIS_IN_CLAUSE = 200;

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
      baseUrl,
      searchSettings: new SearchSettingsModel(this.query || "", [ExpressionExperimentType]),
      options: {
        page: 1,
        itemsPerPage: 25,
        sortBy: [],
        sortDesc: []
      },
      downloadProgress: null
    };
  },
  computed: {
    headers() {
      let h = [];
      h.push(
        {
          text: "Short name",
          value: "shortName"
        }
      );
      if (this.searchSettings.taxon === null) {
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
      if (this.debug && this.searchSettings.query) {
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
      if (this.searchSettings.platform) {
        filter.push([
          "bioAssays.arrayDesignUsed.id = " + this.searchSettings.platform.id,
          "bioAssays.originalPlatform.id = " + this.searchSettings.platform.id]);
      }
      if (this.searchSettings.taxon) {
        filter.push(["taxon.id = " + this.searchSettings.taxon.id]);
      }
      if (this.searchSettings.technologyTypes.length > 0) {
        filter.push(["bioAssays.arrayDesignUsed.technologyType in (" + this.searchSettings.technologyTypes.map(quoteIfNecessary).join(", ") + ")"]);
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
          .groupBy(t => t.classUri || t.className?.toLowerCase() || null)
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
            .sort((a, b) => a.numberOfExpressionExperiments - b.numberOfExpressionExperiment)
            .map(t => t.termUri);
          let termNames = annotationByCategoryId[categoryId]
            .filter(t => t.termName === null)
            .sort((a, b) => a.numberOfExpressionExperiments - b.numberOfExpressionExperiment)
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
        return "";
      }
      return filter.map(a => a.join(" or ")).join(" and ");
    },
    browsingOptions() {
      // query can be null if reset
      if (this.searchSettings.query !== null && this.searchSettings.query.length > 0) {
        return {
          query: this.searchSettings.query,
          filter: this.filter,
          sort: this.options.sortBy[0] && (this.options.sortDesc[0] ? "-" : "+") + this.options.sortBy[0],
          offset: (this.options.page - 1) * this.options.itemsPerPage,
          limit: this.options.itemsPerPage,
          includeBlacklistedTerms: !!this.searchSettings.includeBlacklistedTerms
        };
      } else {
        return {
          filter: this.filter,
          sort: this.options.sortBy[0] && (this.options.sortDesc[0] ? "-" : "+") + this.options.sortBy[0],
          offset: (this.options.page - 1) * this.options.itemsPerPage,
          limit: this.options.itemsPerPage,
          includeBlacklistedTerms: !!this.searchSettings.includeBlacklistedTerms
        };
      }
    },
    ...mapState({
      debug: state => state.debug,
      errors(state) {
        return Object.values(state.api.error)
          .filter(e => e !== null)
          .map(e => e.response?.data?.error || e)
          .slice(0, 1);
      },
      datasets: state => state.api.datasets?.data || [],
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
            itemsLength: state.api.datasets.totalElements
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
      loadingAnnotation: state => !!state.api.pending["datasetsAnnotations"],
      loadingTaxa: state => !!state.api.pending["datasetsTaxa"],
      datasetsPlatforms: state => state.api.datasetsPlatforms?.data || [],
      datasetsTaxa: state => state.api.datasetsTaxa?.data || [],
      taxa: state => state.api.datasetsTaxa?.data || [],
      datasetsAnnotations(state) {
        if (state.api.datasetsAnnotations === undefined) {
          return [];
        }
        // first grouping by category
        let filteredTerms = state.api.datasetsAnnotations.data;
        let termsByCategory = groupBy(filteredTerms, elem => (elem.classUri || elem.className?.toLowerCase()));
        let annotations = [];
        for (let key in termsByCategory) {
          // find the first non-null URI and name for the category
          let classUri = termsByCategory[key].find(el => el.classUri !== null)?.classUri;
          let className = termsByCategory[key].find(el => el.className !== null)?.className;
          annotations.push({
            classUri: classUri,
            className: className,
            children: termsByCategory[key]
          });
        }
        return annotations;
      },
      myself: state => state.api.myself?.data
    })
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
      });
    }, 1000),
    browse(browsingOptions, updateEverything) {
      return compressArg(browsingOptions.filter).then(compressedFilter => {
        // update available annotations and number of datasets
        let updateDatasetsPromise = this.updateDatasets(browsingOptions.query, compressedFilter, browsingOptions.offset, browsingOptions.limit, browsingOptions.sort);
        if (updateEverything) {
          // since the query or filters have changed, reset the browsing offset to the beginning
          browsingOptions.offset = 0;
          this.options.page = 1;
          let updateDatasetsAnnotationsPromise;
          if (browsingOptions.includeBlacklistedTerms) {
            updateDatasetsAnnotationsPromise = this.updateAvailableAnnotations(browsingOptions.query, compressedFilter);
          } else {
            updateDatasetsAnnotationsPromise = compressArg(blacklistedTerms.join(","))
              .then(excludedTerms => this.updateAvailableAnnotations(browsingOptions.query, compressedFilter, excludedTerms));
          }
          let updateDatasetsPlatformsPromise = this.updateAvailablePlatforms(browsingOptions.query, compressedFilter);
          let updateDatasetsTaxaPromise = this.updateAvailableTaxa(browsingOptions.query, compressedFilter);
          return Promise.all([updateDatasetsPromise, updateDatasetsAnnotationsPromise, updateDatasetsPlatformsPromise, updateDatasetsTaxaPromise]);
        } else {
          return updateDatasetsPromise;
        }
      });
    },
    updateDatasets(query, filter, offset, limit, sort) {
      let payload = { query: query, filter: filter, offset: offset, limit: limit, sort: sort };
      if (query !== undefined) {
        payload["query"] = query;
      }
      return this.$store.dispatch("api/getDatasets", {
        params: payload
      });
    },
    updateAvailableAnnotations(query, filter, excludedTerms) {
      let payload = {
        filter: filter,
        // the cap limit is 5000, so anything below 4 is useless
        minFrequency: filter.length > 0 ? 1 : excludedTerms ? 4 : 3,
        exclude: ["parentTerms"]
      };
      if (query !== undefined) {
        payload["query"] = query;
      }
      if (excludedTerms !== undefined) {
        payload["excludedTerms"] = excludedTerms;
      }
      return this.$store.dispatch("api/getDatasetsAnnotations", { params: payload });
    },
    updateOpenApiSpecification() {
      return this.$store.dispatch("api/getOpenApiSpecification");
    },
    updateAvailableTaxa(query, filter) {
      let payload = query !== undefined ? { query: query, filter: filter } : { filter: filter };
      return this.$store.dispatch("api/getDatasetsTaxa", { params: payload });
    },
    updateAvailablePlatforms(query, filter) {
      let payload = query !== undefined ? { query: query, filter: filter } : { filter: filter };
      return this.$store.dispatch("api/getDatasetsPlatforms", { params: payload });
    },
    hasHighlight(item) {
      return item.searchResult !== undefined && item.searchResult.highlights !== null;
    },
    getHighlight(item) {
      return Object.entries(item.searchResult.highlights)
        .filter(h => h[0] !== "name") // the name is highlighted in the table
        .map(h => marked.parseInline("**Tagged " + h[0] + ":** " + h[1]))
        .join("<br/>");
    },
    getName(item) {
      if (this.hasHighlight(item) && "name" in item.searchResult.highlights) {
        return highlight(item.name, item.searchResult.highlights.name);
      } else {
        return item.name;
      }
    }
  },
  created() {
    compressArg(blacklistedTerms.join(",")).then((excludedTerms) => {
      return Promise.all([
        this.updateOpenApiSpecification(),
        this.updateAvailableTaxa(undefined, this.filter),
        this.updateAvailablePlatforms(undefined, this.filter),
        this.updateAvailableAnnotations(undefined, this.filter, excludedTerms),
        this.browse(this.browsingOptions)])
        .catch(err => console.error(`Error while loading initial data: ${err.message}.`, err));
    });
  },
  watch: {
    query: function(newVal) {
      this.searchSettings.query = newVal !== undefined ? newVal : null;
    },
    totalNumberOfExpressionExperiments: function(newVal) {
      if (newVal > 0) {
        this.$store.commit("setTitle", "Showing "+ newVal + " results");
      } else {
        this.$store.commit("setTitle", null);
      }
    },
    "browsingOptions": function(newVal, oldVal) {
      let promise;
      if (oldVal !== undefined && (oldVal.query !== newVal.query || oldVal.filter !== newVal.filter || oldVal.includeBlacklistedTerms !== newVal.includeBlacklistedTerms)) {
        // query has changed, debounce
        if (oldVal.query !== newVal.query) {
          promise = this.search(newVal) || Promise.resolve();
        } else if (oldVal.filter !== newVal.filter) {
          promise = this.browse(newVal, true);
        } else if (oldVal.includeBlacklistedTerms !== newVal.includeBlacklistedTerms) {
          if (newVal.includeBlacklistedTerms) {
            promise = this.updateAvailableAnnotations(newVal.query, newVal.filter);
          } else {
            promise = compressArg(blacklistedTerms.join(","))
              .then(excludedTerms => this.updateAvailableAnnotations(newVal.query, newVal.filter, excludedTerms));
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
        this.browse(this.browsingOptions, true).catch(err => {
          console.error("Error while updating datasets after logged user changed: " + err.message + ".", err);
        });
      }
    }
  }
};
</script>

<style>
.v-data-table__wrapper {
    margin-bottom: 59px;
    max-height: 100%;
}

.v-data-table-header th {
    white-space: nowrap;
}

.v-data-footer {
    background: white;
    position: fixed;
    width: 100%;
    bottom: 0;
    right: 0;
    margin-right: 0 !important;
}
</style>