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
                            :total-number-of-expression-experiments="totalNumberOfExpressionExperiments"
                            :debug="debug"/>
        </v-navigation-drawer>
        <v-main>
            <v-alert v-for="(error, key) in errors" :key="key" type="error">
                <div v-html="error"></div>
            </v-alert>
            <v-data-table
                    loading-text="We're working hard on your query..."
                    no-data-text="Put something in the search bar to get some results."
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
                    <a :href="baseUrl + '/expressionExperiment/showExpressionExperiment.html?id=' + item.id">{{
                            item.shortName
                        }}</a>
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
                    <DownloadButton :browsing-options="browsingOptions"
                                    :total-number-of-expression-experiments="totalNumberOfExpressionExperiments"
                                    :max-datasets="100"
                                    :progress.sync="downloadProgress"
                                    class="mr-3"/>
                </template>
            </v-data-table>
        </v-main>
        <v-navigation-drawer v-if="false">
            <v-card class="mb-3 overflow-y-auto" style="max-height: 400px;">
                <v-card-text>
                    <div v-if="loading">
                        Pending requests:
                        <v-chip v-for="(e, index) in loadingEndpoints" :key="index">{{ e }}</v-chip>
                        <br/>
                        <div v-if="dispatchedBrowsingOptions">
                            Dispatched query:
                            <pre style="white-space: pre-wrap">{{
                                    dispatchedBrowsingOptions.filter || "Everything"
                                }}</pre>
                            <span>Sort: {{ dispatchedBrowsingOptions.sort }}</span><br/>
                            <span>Offset: {{ dispatchedBrowsingOptions.offset }}</span><br/>
                            <span>Limit: {{ dispatchedBrowsingOptions.limit }}</span>
                        </div>
                    </div>
                    <div v-if="appliedBrowsingOptions">
                        Applied query:<br/>
                        <span>
                                    Filter:
                                    <span style="font-family: monospace">{{
                                            appliedBrowsingOptions.filter || "Everything"
                                        }}</span>
                                </span><br/>
                        <span>Sort: {{ appliedBrowsingOptions.sort }}</span><br/>
                        <span>Offset: {{ appliedBrowsingOptions.offset }}</span><br/>
                        <span>Limit: {{ appliedBrowsingOptions.limit }}</span>
                    </div>
                </v-card-text>
            </v-card>
        </v-navigation-drawer>
    </v-layout>
</template>

<script>
import SearchSettings from "@/components/SearchSettings";
import { ExpressionExperimentType, SearchSettings as SearchSettingsModel } from "@/models";
import { mapState } from "vuex";
import { baseUrl, blacklistedTerms, marked } from "@/config/gemma";
import { chain, debounce, groupBy, sumBy } from "lodash";
import DatasetPreview from "@/components/DatasetPreview.vue";
import { highlight } from "@/search-utils";
import DownloadButton from "@/components/DownloadButton.vue";
import { formatDecimal, formatNumber, formatPercent } from "@/utils";

const MAX_URIS_IN_CLAUSE = 100;

function quoteIfNecessary(s) {
  if (s.match(/[(), "]/) || s.length === 0) {
    return "\"" + s.replaceAll("\"", "\\") + "\"";
  } else {
    return s;
  }
}

export default {
  name: "Browser",
  components: { DownloadButton, SearchSettings, DatasetPreview },
  props: {
    /**
     * Initial query
     */
    query: String
  },
  data() {
    return {
      searchSettings: new SearchSettingsModel(this.query || "", [ExpressionExperimentType]),
      options: {
        page: 1,
        itemsPerPage: 25,
        sortBy: [],
        sortDesc: []
      },
      dispatchedBrowsingOptions: null,
      baseUrl: baseUrl,
      blacklistedTerms: blacklistedTerms,
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
          console.error("Too many categories (" + categories.length + ") in clause.");
        } else if (categories.length > 0) {
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
          let categoryName = annotationByCategoryId[categoryId].find(t => t.className === null)?.className || null;
          // FIXME: the category should be in a conjunction with the value, but that is not supported
          // add a clause for the category, this is not exactly correct
          if (categoryUri !== null) {
            filter.push(["allCharacteristics.categoryUri = " + quoteIfNecessary(categoryId)]);
          } else if (categoryName !== null) {
            filter.push(["allCharacteristics.category = " + quoteIfNecessary(categoryId)]);
          } else {
            console.warn("Selection of the 'Uncategorized' category is not supported.");
          }
          let termUris = annotationByCategoryId[categoryId].filter(t => t.termUri !== null).map(t => t.termUri);
          let termNames = annotationByCategoryId[categoryId].filter(t => t.termName === null).map(t => t.termName);
          let f = [];
          if (termUris.length > MAX_URIS_IN_CLAUSE) {
            console.error("Too many annotations (" + termUris.length + ") selected under " + categoryId);
          } else if (termUris.length > 0) {
            f.push("allCharacteristics.valueUri in (" + termUris.map(quoteIfNecessary).join(", ") + ")");
          }
          if (termNames.length > MAX_URIS_IN_CLAUSE) {
            console.error("Too many annotations (" + temrNames.length + ") selected under " + categoryId);
          } else if (termNames.length > 0) {
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
          includeBlacklistedTerms: this.searchSettings.includeBlacklistedTerms
        };
      } else {
        return {
          filter: this.filter,
          sort: this.options.sortBy[0] && (this.options.sortDesc[0] ? "-" : "+") + this.options.sortBy[0],
          offset: (this.options.page - 1) * this.options.itemsPerPage,
          limit: this.options.itemsPerPage,
          includeBlacklistedTerms: this.searchSettings.includeBlacklistedTerms
        };
      }
    },
    debug() {
      return process.env.NODE_ENV !== "production";
    },
    ...mapState({
      errors: state => Object.values(state.api.error).filter(e => e !== null).map(e => e.response?.data?.error?.message || e.message),
      datasets: state => state.api.datasets.data || [],
      totalNumberOfExpressionExperiments: state => state.api.datasets?.totalElements || 0,
      footerProps: state => {
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
      /**
       * Applied browsing options or undefined if nothing is being browsed.
       */
      appliedBrowsingOptions: state => {
        return {
          filter: state.api.datasets.filter,
          sort: state.api.datasets.sort?.direction + state.api.datasets.sort?.orderBy,
          offset: state.api.datasets.offset,
          limit: state.api.datasets.limit
        };
      },
      technologyTypes(state) {
        // FIXME: I don't understand how state.api.openApiSpecification
        if (state.api.openApiSpecification && state.api.openApiSpecification.components !== undefined) {
          const filterableProperties = state.api.openApiSpecification.components.schemas["FilterArgExpressionExperiment"]["x-gemma-filterable-properties"];
          const technologyTypes = filterableProperties.find(prop => prop.name === "bioAssays.arrayDesignUsed.technologyType");
          return technologyTypes["allowedValues"].map(elem => {
            return { id: elem.value, label: elem.label };
          });
        } else {
          return [];
        }
      },
      /**
       * Check if there is a pending search.
       * TODO: handle search cancellation
       */
      loading: state => state.api.pending["datasets"] || state.api.pending["datasetsPlatforms"] || state.api.pending["datasetsAnnotations"],
      loadingDatasets: state => !!state.api.pending["datasets"],
      loadingPlatforms: state => !!state.api.pending["datasetsPlatforms"],
      loadingAnnotation: state => !!state.api.pending["datasetsAnnotations"],
      loadingTaxa: state => !!state.api.pending["datasetsTaxa"],
      loadingEndpoints: state => Object.entries(state.api.pending).filter(e => e[1]).map(e => e[0]),
      datasetsPlatforms: state => state.api.datasetsPlatforms.data || [],
      datasetsTaxa: state => state.api.datasetsTaxa.data || [],
      taxa: state => state.api.datasetsTaxa.data || [],
      datasetsAnnotations(state) {
        if (state.api.datasetsAnnotations.data === undefined) {
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
      }
    })
  },
  methods: {
    formatDecimal,
    formatNumber,
    formatPercent,
    /**
     * Basically a browse with a debounce when the user is actively typing a query.
     */
    search: debounce(function(browsingOptions) {
      return this.browse(browsingOptions, true)
        .then(() => {
          let location = browsingOptions.query ? "/q/" + encodeURIComponent(browsingOptions.query) : "/";
          // because this is debounced, it's possible that two consecutive searches are performed with the same query
          // i.e. user types "brain" and obtain results, then deletes one char "brai" and add one char back to "brain"
          // in less than 1s
          if (location !== this.$router.currentRoute.fullPath) {
            return this.$router.push(location);
          }
        });
    }, 1000),
    browse(browsingOptions, updateEverything) {
      // update available annotations and number of datasets
      let updateDatasetsPromise = this.$store.dispatch("api/getDatasets", {
        params: browsingOptions
      });
      if (updateEverything) {
        // since the query or filters have changed, reset the browsing offset to the beginning
        browsingOptions.offset = 0;
        this.options.page = 1;
        let updateDatasetsAnnotationsPromise = this.updateAvailableAnnotations(browsingOptions.query, browsingOptions.filter, browsingOptions.includeBlacklistedTerms);
        let updateDatasetsPlatformsPromise = this.updateAvailablePlatforms(browsingOptions.query, browsingOptions.filter);
        let updateDatasetsTaxaPromise = this.updateAvailableTaxa(browsingOptions.query, browsingOptions.filter);
        return Promise.all([updateDatasetsPromise, updateDatasetsAnnotationsPromise, updateDatasetsPlatformsPromise, updateDatasetsTaxaPromise]);
      } else {
        return updateDatasetsPromise;
      }
    },
    updateAvailableAnnotations(query, filter, includeBlacklistedTerms) {
      let payload = {
        filter: filter,
        // the cap limit is 5000, so anything below 4 is useless
        minFrequency: filter.length > 0 ? 1 : includeBlacklistedTerms ? 4 : 3,
        excludedTerms: includeBlacklistedTerms ? [] : this.blacklistedTerms,
        exclude: ["parentTerms"]
      };
      if (query !== undefined) {
        payload["query"] = query;
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
    Promise.all([
      this.updateOpenApiSpecification(),
      this.updateAvailableTaxa(undefined, this.filter),
      this.updateAvailablePlatforms(undefined, this.filter),
      this.updateAvailableAnnotations(undefined, this.filter, false),
      this.browse(this.browsingOptions)])
      .catch(err => console.error(err));
  },
  watch: {
    "browsingOptions": function(newVal, oldVal) {
      this.dispatchedBrowsingOptions = newVal;
      if (oldVal !== undefined && (oldVal.query !== newVal.query || oldVal.filter !== newVal.filter || oldVal.includeBlacklistedTerms !== newVal.includeBlacklistedTerms)) {
        // query has changed, debounce
        if (oldVal.query !== newVal.query) {
          return this.search(newVal);
        } else if (oldVal.filter !== newVal.filter) {
          return this.browse(newVal, true);
        } else if (oldVal.includeBlacklistedTerms !== newVal.includeBlacklistedTerms) {
          return this.updateAvailableAnnotations(newVal.query, newVal.filter, newVal.includeBlacklistedTerms);
        }
      } else {
        // filter and query are unchanged, we don't need to update everything
        return this.browse(newVal, false);
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

thead.v-data-table-header > tr > th {
    background: white;
    position: sticky;
    top: 0;
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