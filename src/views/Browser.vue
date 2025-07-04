<template>
    <v-layout>
        <v-navigation-drawer v-model="drawer" app width="400">
            <SearchSettings v-model="searchSettings"
                            class="py-3 px-3"
                            :taxon-disabled="loadingTaxa"
                            :query-disabled="loadingDatasets"
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
                    :expanded="expansionToggle"
                    ref="dataTableRef"
                    fixed-header
                    dense class="browser-data-table"
            >
                <template v-slot:footer.page-text="{pageStart, pageStop, itemsLength}">
                  <div>
                    {{formatNumber(pageStart)}} - {{formatNumber(pageStop)}} of {{formatNumber(itemsLength)}}
                  </div>
                </template>>
                <template v-for="h in headers" v-slot:[`header.${h.value}`]>
                    <v-tooltip :key="h.value" bottom v-if="h.tip" max-width="300px">
                        <template v-slot:activator="{ on }">
                            <span v-on="on">{{ h.text }}</span>
                        </template>
                        <span>{{ h.tip }}</span>
                    </v-tooltip>
                    <span v-else :key="h.value">{{ h.text }}</span>
                </template>
                <template v-slot:item.shortName="{item}">
                    <a :href="getUrl(item)" target="_blank">
                        {{ item.shortName }}
                    </a>
                </template>
                <template v-slot:item.resultObject="{item}">
                    <span>{{ item }}</span>
                </template>
                <template v-slot:item.name="{item}">
                    <td style="width: 100%">
                        <span v-html="getName(item)"/>
                        <br v-if="debug && hasHighlight(item)"/>
                        <small v-if="debug && hasHighlight(item)"
                               v-html="getHighlight(item)">
                        </small>
                    </td>
                </template>
                <template v-slot:item.geeq.publicQualityScore="{ item }">
                    <v-tooltip v-if="item.geeq" left>
                        <template v-slot:activator="{ on }">
                            <v-icon v-if="item.geeq.publicQualityScore > 0.45" class="emoticon" color="green" v-on="on">
                                mdi-emoticon-happy
                            </v-icon>
                            <v-icon v-else-if="item.geeq.publicQualityScore > 0.1" class="emoticon"
                                    color="amber lighten-1" v-on="on">mdi-emoticon-neutral
                            </v-icon>
                            <v-icon v-else class="emoticon" color="red" v-on="on">mdi-emoticon-sad</v-icon>
                        </template>
                        <div>
                            Quality: {{ formatDecimal(item.geeq.publicQualityScore) }}
                        </div>
                    </v-tooltip>
                    <span v-else></span>
                </template>
                <template v-slot:item.lastUpdated="{item}">
                    {{ item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : "" }}
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
                        <DatasetPreview :dataset="item"
                                        :selected-categories="searchSettings.categories"
                                        :selected-annotations="searchSettings.annotations"
                                        :available-annotations="datasetsAnnotations"
                                        @annotation-selected="selectTerm"
                                        @annotation-unselected="unselectTerm"/>
                    </td>
                </template>
                <template v-slot:item.isSingleCell="{ item }">
                  <v-icon v-if="isSingleCell(item)" color = "green">
                    mdi-check-bold
                  </v-icon>
                </template>
              <template v-slot:item.hasDiffExp = "{ item }">
                <v-icon v-if="hasDifferentialExpression[item.id]" color = "green">
                  mdi-check-bold
                </v-icon>
              </template>
                <template v-slot:item.curationNote="{ item }">
                  <v-tooltip v-if="item.curationNote" left>
                    <template v-slot:activator="{ on }">
                      <v-icon v-if="item" color="orange" v-on="on">
                        mdi-alert-octagon-outline
                      </v-icon>
                    </template>
                    <div>
                      {{ item.curationNote }}
                    </div>
                  </v-tooltip>
                </template>
                <template v-slot:footer.prepend>
                    <v-btn v-show="!drawer" icon @click="drawer = true">
                        <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                    <v-btn v-if="datasetsAllExpanded" class="expand-all-button d-none d-md-flex" text
                           color="grey darken-2" @click=toggleAllDatasetsExpanded>
                        <v-icon color="grey darken-2"> mdi-chevron-down</v-icon>
                        Expand all datasets
                    </v-btn>
                    <v-btn v-else class="expand-all-button d-none d-md-flex" text color="grey darken-2"
                           @click=toggleAllDatasetsExpanded>
                        <v-icon color="grey darken-2"> mdi-chevron-up</v-icon>
                        Collapse all datasets
                    </v-btn>
                    <v-spacer/>
                    <v-menu ref="codeSnippetMenu">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn plain v-on="on" v-bind="attrs">
                                <span style="text-transform: none;">Dataset download code</span>
                                <v-icon>mdi-chevron-up</v-icon>
                            </v-btn>
                        </template>
                        <CodeSnippet :browsing-options="browsingOptions"
                                     :search-settings="searchSettings"
                                     :total-number-of-expression-experiments="totalNumberOfExpressionExperiments"
                                     @resize="$refs.codeSnippetMenu.onResize()"/>
                    </v-menu>
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
import { ExpressionExperimentType, SearchSettings as SearchSettingsModel } from "@/lib/models";
import {
  baseUrl,
  categoriesConfiguration,
  excludedCategories,
  excludedTerms,
  HIGHLIGHT_LABELS,
  marked,
  taxa,
  axiosInst
} from "@/config/gemma";
import { debounce, escapeRegExp, isEqual } from "lodash";
import DatasetPreview from "@/components/DatasetPreview.vue";
import { highlight } from "@/lib/highlight";
import DownloadButton from "@/components/DownloadButton.vue";
import {
  compressArg,
  compressFilter,
  formatDecimal,
  formatNumber,
  formatPercent,
  getCategoryId,
  getTermId,
  swallowCancellation
} from "@/lib/utils";
import { generateFilter, generateFilterDescription, generateFilterSummary } from "@/lib/filter";
import Error from "@/components/Error.vue";
import { mapMutations, mapState } from "vuex";
import CodeSnippet from "@/components/CodeSnippet.vue";
import axios from "axios";

const MAX_CATEGORIES = 20;
const MAX_TERMS_PER_CATEGORY = 200;
const MAX_PLATFORMS = 200;

export default {
  name: "Browser",
  components: { Error, DownloadButton, SearchSettings, DatasetPreview, CodeSnippet },
  props: {
    /**
     * Initial taxon.
     */
    initialTaxon: String,
    preset: String,
    /**
     * Initial query
     */
    query: String
  },
  data() {
    let taxon = [];
    if (this.initialTaxon) {
      for (let t of taxa) {
        if ((t.id + "" === this.initialTaxon) || t.commonName.toLowerCase() === this.initialTaxon.toLowerCase() || t.scientificName.toLowerCase() === this.initialTaxon.toLowerCase()) {
          taxon.push(t);
        }
      }
    }
    let platform = [];
    if(this.preset && this.preset ==="scrnaseq"){
      platform = ['http://purl.obolibrary.org/obo/OBI_0003109','http://purl.obolibrary.org/obo/OBI_0002631']
    }
    return {
      drawer: true,
      searchSettings: new SearchSettingsModel(taxon, this.query, [ExpressionExperimentType], platform),
      options: {
        page: 1,
        itemsPerPage: 25,
        sortBy: ["id"],
        sortDesc: [true]
      },
      downloadProgress: null,
      expansionToggle: [],
      tableWidth: "",
      inferredTermLabelsByCategory:{},
      hasDifferentialExpression:{},
      /**
     * Basically a browse with a debounce when the user is actively typing a query.
     * @return {Promise|undefined} initially undefined, then a promise once the function has been invoked at least once
     */
    search:function(browsingOptions) {
      // debouncing no longer necesary with mandatory return key press to execute the search, TODO cleanup this part
      // had to move search into data to be able to flush debounce
      // https://stackoverflow.com/questions/52987115/using-vue-js-how-to-you-flush-a-method-that-is-debounced-with-lodash
      return this.browse(browsingOptions, true).then(() => {
        let location = browsingOptions.query ? "/q/" + encodeURIComponent(browsingOptions.query) : "/";
        // because this is debounced, it's possible that two consecutive searches are performed with the same query
        // i.e. user types "brain" and obtain results, then deletes one char "brai" and add one char back to "brain"
        // in less than 1s
        if (location !== this.$router.currentRoute.fullPath) {
          return this.$router.push(location);
        }
      }).catch(swallowCancellation)
        .catch(err => {
          // because the function is debounced, the caller might never get resulting promise and ability to handle the error
          console.error("Error while searching: " + err.message + ".", err);
          this.setLastError(err);
        });
    }
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
        },
        {
          text: "Taxon",
          value: "taxon"
        },
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
          text: "Quality",
          value: "geeq.publicQualityScore",
          align: "center",
          tip: "Quality refers to data quality, wherein the same study could have been done twice with the same technical parameters and in one case yield bad quality data, and in another high quality data"
        }
      );
      if (this.myself && this.myself.group === 'Administrators'){
        h.push(
            {
              text: "Diff. Exp.",
              value: "hasDiffExp",
              sortable: false,
              align: "center"
            }
        )
      }

      if ( this.myself && this.myself.group === 'Administrators' && this.datasets.some(dataset=>{return this.isSingleCell(dataset)}) ){
        h.push({
          text: "Single Cell",
          value: "isSingleCell",
          align: "center",
          sortable: false
        })
      }
      
      h.push(
        {
          text: "Last Updated",
          value: "lastUpdated"
        }
      );
      if (this.myself && this.myself.group === 'Administrators'){
        h.push({
          text: "Curation",
          value: "curationNote",
          align: "center",
          tip: "Sorting sorts by needsAttention field",
          sortable: true
        });
      }
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
      return generateFilter(this.searchSettings);
    },
    browsingOptions() {
      let sort = this.options.sortBy[0] && (this.options.sortDesc[0] ? "-" : "+") + this.options.sortBy[0]
      if (this.options.sortBy[0] == "curationNote") {
        sort = "curationDetails.needsAttention" && (this.options.sortDesc[0] ? "-" : "+") + "curationDetails.needsAttention"
      }
      // query can be null if reset
      if (this.searchSettings.query && this.searchSettings.query.length > 0) {
        return {
          query: this.searchSettings.query,
          filter: this.filter,
          sort: sort,
          offset: (this.options.page - 1) * this.options.itemsPerPage,
          limit: this.options.itemsPerPage,
          ignoreExcludedTerms: !!this.searchSettings.ignoreExcludedTerms
        };
      } else {
        return {
          filter: this.filter,
          sort: sort,
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
       * @returns {String|undefined}
       */
      appliedQuery(state) {
        return state.api.datasets?.query;
      },
      appliedFilter(state) {
        return state.api.datasets?.filter;
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
    annotations(){
      return this.searchSettings.annotations
    },
    filterSummary() {
      return generateFilterSummary(this.searchSettings);
    },
    filterDescription() {
      return generateFilterDescription(this.searchSettings,this.inferredTermLabelsByCategory);
    },
    datasetsAllExpanded() {
      return this.datasets.every(dataset => {
        return !this.expansionToggle.some(item => item.accession === dataset.accession);
      });
    }
  },
  methods: {
    formatDecimal,
    formatPercent,
    formatNumber,
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
            .then(([excludedCategories, excludedTerms]) => this.updateAvailableCategories(browsingOptions.query, browsingOptions.filter, excludedCategories, true, excludedTerms, true));
        }
        let updateDatasetsPlatformsPromise = this.updateAvailablePlatforms(browsingOptions.query, browsingOptions.filter);
        let updateDatasetsTaxaPromise = this.updateAvailableTaxa(browsingOptions.query, browsingOptions.filter);
        return Promise.all([updateDatasetsPromise, updateDatasetsAnnotationsPromise, updateDatasetsPlatformsPromise, updateDatasetsTaxaPromise]);
      } else {
        return updateDatasetsPromise;
      }
    },
    async updateDatasets(query, filter, offset, limit, sort) {
      let compressedFilter = await compressFilter(filter);
      let payload = { filter: compressedFilter, offset: offset, limit: limit, sort: sort };
      if (query !== undefined) {
        payload["query"] = query;
      }
      if (this.myself) {
        payload["gid"] = this.myself.group;
      }
      return this.$store.dispatch("api/getDatasets", {
        params: payload
      });
    },
    /**
     * Update available categories.
     */
    async updateAvailableCategories(query, filter, excludedCategories, excludeFreeTextCategories, excludedTerms, excludeUncategorizedTerms) {
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
      let compressedFilter = await compressFilter(mFilter);
      let payload = {
        filter: compressedFilter,
        limit: MAX_CATEGORIES
      };
      if (query !== undefined) {
        payload["query"] = query;
      }
      if (excludedCategories !== undefined) {
        payload["excludedCategories"] = excludedCategories;
      }
      if (excludeFreeTextCategories) {
        payload["excludeFreeTextCategories"] = "true";
      }
      if (excludeUncategorizedTerms) {
        payload["excludeUncategorizedTerms"] = "true";
      }
      if (excludedTerms !== undefined) {
        payload["excludedTerms"] = excludedTerms;
      }
      if (this.myself) {
        payload["gid"] = this.myself.group;
      }
      // proactively query categories we already know about, otherwise we have to wait until the
      // getDatasetsCategories() endpoint finishes
      // because those promise can fail by the time we start retrieving dataset categories, we have to handle possible
      // cancellation/errors right away
      let proactiveCategories = this.datasetsAnnotations.map(getCategoryId);
      let proactivePromises = proactiveCategories
        .map(categoryId => this.updateAvailableAnnotationsByCategory(categoryId, query, filter, excludedTerms)
          .catch(swallowCancellation)
          .catch(this.setLastError));
      let data = await this.$store.dispatch("api/getDatasetsCategories", { params: payload });
      if (data.data.error) {
        console.error("Retrieving datasets categories failed.", data.data.error);
        return;
      }
      let finalCategories = data.data.data.map(category => getCategoryId(category));
      // TODO: cancel promises we don't need
      // for (let categoryId of proactiveCategories) {
      //   if (!finalCategories.includes(categoryId)) {
      //     proactivePromises[proactiveCategories.indexOf(categoryId)].cancel();
      //   }
      // }
      // wait on proactive promise or dispatched one if missing
      return Promise.all(finalCategories.map(categoryId => {
        if (proactiveCategories.includes(categoryId)) {
          // wait on the proactive promise
          return proactivePromises[proactiveCategories.indexOf(categoryId)];
        } else {
          return this.updateAvailableAnnotationsByCategory(categoryId, query, filter, excludedTerms);
        }
      }));
    },
    /**
     * Update available annotations for a specific category.
     *
     * To get accurate counts, we have to exclude all the clauses involving terms from the category. This is a bit
     * tricky because at this point the filter is already generated, so we remove clauses matching a regex constructed
     * by concatenating all the terms in the category.
     */
    async updateAvailableAnnotationsByCategory(category, query, filter, excludedTerms) {
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
      let categoryConfig = categoriesConfiguration[category] || {};
      // exclude filters for the category
      let compressedFilter = await compressFilter(filter);
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
        // FIXME: have a parameter to apply category exclusions, having this here is a proxy for ignoreExcludedTerms
        if (categoryConfig.excludeFreeTextTerms) {
          payload["excludeFreeTextTerms"] = "true";
        }
      }
      if (this.myself) {
        payload["gid"] = this.myself.group;
      }
      return this.$store.dispatch("api/getDatasetsAnnotationsByCategory", { params: payload });
    },
    updateOpenApiSpecification() {
      return this.$store.dispatch("api/getOpenApiSpecification");
    },
    async updateAvailableTaxa(query, filter) {
      // remove any clauses involving taxon
      if (filter) {
        filter = filter.map(clause => clause.filter(subClause => !subClause.startsWith("taxon."))).filter(clause => clause.length > 0);
      }
      let compressedFilter = await compressFilter(filter);
      let payload = { filter: compressedFilter };
      if (query) {
        payload["query"] = query;
      }
      if (this.myself) {
        payload["gid"] = this.myself.group;
      }
      return this.$store.dispatch("api/getDatasetsTaxa", { params: payload });
    },
    async updateAvailablePlatforms(query, filter) {
      // remove any clauses involving platforms
      if (filter) {
        filter = filter.map(clause => clause.filter(subClause => !subClause.startsWith("bioAssays.arrayDesignUsed.") && !subClause.startsWith("bioAssays.originalPlatform."))).filter(clause => clause.length > 0);
      }
      let compressedFilter = await compressFilter(filter);
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
    },
    hasHighlight(item) {
      return item.searchResult !== undefined && item.searchResult.highlights !== null;
    },
    getHighlight(item) {
      return Object.entries(item.searchResult.highlights)
          .map(h => ("Tagged " + (HIGHLIGHT_LABELS[h[0]] || h[0]) + ": " + h[1])
              .replaceAll(/\*\*(?=[^\s\p{P}])/gu,'<mark>')
              .replaceAll(/(?<=[^\s\p{P}])\*\*/gu,'</mark>'))
          .join("<br/>")
    },
    getName(item) {
      if (this.hasHighlight(item) && "name" in item.searchResult.highlights) {
        return marked.parseInline(highlight(item.name, item.searchResult.highlights.name));
      } else {
        return marked.parseInline(item.name);
      }
    },
    getUrl(item) {
      return baseUrl + "/expressionExperiment/showExpressionExperiment.html?id=" + encodeURIComponent(item.id);
    },
    isSingleCell(item){
      return item.characteristics.some((characteristic)=>characteristic.valueUri === "http://www.ebi.ac.uk/efo/EFO_0008913")
    },
    ...mapMutations(["setTitle", "setFilterSummary", "setFilterDescription", "setLastError"]),
    selectTerm(previewTerm) {
      this.searchSettings.annotations.push({
        classUri: previewTerm.classUri,
        className: previewTerm.className,
        termUri: previewTerm.termUri,
        termName: previewTerm.termName
      });
    },
    unselectTerm(previewTerm) {
      let categoryId = getCategoryId(previewTerm);
      let termId = getTermId(previewTerm);
      for (let [i, a] of this.searchSettings.annotations.entries()) {
        if (getCategoryId(a) === categoryId && getTermId(a) === termId) {
          this.searchSettings.annotations.splice(i, 1);
          return;
        }
      }
      console.warn(`${previewTerm} is not selected and thus cannot be unselected.`);
    },
    ...mapMutations(["setTitle", "setFilterSummary", "setFilterDescription"]),
    toggleAllDatasetsExpanded() {
      // check whether all datasets are expanded
      const expansionKeys = Object.keys(this.$refs.dataTableRef.expansion); // get expanded datasets
      const expansionKeysNum = expansionKeys.map(eKeys => Number(eKeys));
      const datasetIds = this.datasets.map(dataset => dataset.id); // get ids for all datasets
      const allDatasetsExpanded = datasetIds.every(id => expansionKeysNum.includes(id)); // check if all dataset ids are present in expanded

      // toggle expansion
      if (allDatasetsExpanded === true) { // If all datasets are already expanded change toggle to empty array and toggle the state to change the arrow direction
        this.expansionToggle = [];
      } else { // If all datasets are not already expanded change expansionToggle to all datasets and set allDatasetsExpanded to reflect change
        this.expansionToggle = this.datasets;
      }
      ;
    }
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
          this.updateAvailableCategories(query, filter, excludedCategories, true, excludedTerms, true),
          this.browse(this.browsingOptions)])
          .catch(swallowCancellation)
          .catch(err => console.error(`Error while loading initial data: ${err.message}.`, err));
      });
  },
  mounted() {
    let observer = new ResizeObserver((entries) => {
      let newWidth = entries[0].contentRect.width;
      //this.$refs.dataTableRef.footer.$el.width = newWidth;
      this.tableWidth = newWidth + "px";
    });
    observer.observe(this.$refs.dataTableRef.$el);
    this.setFilterSummary(this.filterSummary)
    this.setFilterDescription(this.filterDescription)
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
    browsingOptions: function(newVal, oldVal) {
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
              .then(([excludedCategories, excludedTerms]) => this.updateAvailableCategories(newVal.query, newVal.filter, excludedCategories, true, excludedTerms, true));
          }
        } else {
          promise = Promise.resolve();
        }
      } else {
        // filter and query are unchanged, we don't need to update everything
        promise = this.browse(newVal, false);
      }
      promise
        .catch(swallowCancellation)
        .catch(err => {
          console.error(`Error while updating datasets after browsing options changed: ${err.message}.`, err);
          this.setLastError(err);
        });
    },
    myself: function(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.browse(this.browsingOptions, true)
          .catch(swallowCancellation)
          .catch(err => {
            console.error(`Error while updating datasets after logged user changed: ${err.message}.`, err);
            this.setLastError(err);
          });
      }
    },
    datasets: function(newVal) {
      if( this.myself && this.myself.group === 'Administrators'){
        let url_prefix = baseUrl + '/rest/v2/datasets/'
        let url_suffix = "/analyses/differential"
        newVal.filter(dataset => {
          return !Object.keys(this.hasDifferentialExpression).includes(dataset.id)
        }).forEach(dataset => {
          axiosInst.get(url_prefix + dataset.id + url_suffix).then(res => {
            this.$set(this.hasDifferentialExpression, dataset.id, res.data.data.length > 0)
          })
              .catch(swallowCancellation)
              .catch(err => {
                if (err.message != 'Request failed with status code 404') {
                  console.error(`Error when requesting differential expressions: ${err.message}.`, err);
                  this.setLastError(err)
                }
              })
        })
      }
    },
    annotations: function(newVal){
      // clear inferred terms of the previous call
      this.inferredTermLabelsByCategory = {}

      // updates inferredTemsLabelsByCategory
      let url = baseUrl + "/rest/v2/annotations/children/"

      newVal.filter(val => val.termUri != null)
        .forEach(value => {
          axios.get(url,{
          params: {uri:value.termUri, direct:false}
        }).then(res => {
          let inferredTerms = Object.fromEntries(res.data.data.map(value=>{
            return [value.valueUri,value.value]
          }))
          this.$set(this.inferredTermLabelsByCategory,value.classUri, Object.assign({},this.inferredTermLabelsByCategory[value.classUri], inferredTerms))
          //this.inferredTermLabelsByCategory[value.classUri] = Object.assign({},this.inferredTermLabelsByCategory[value.classUri], inferredTerms)
        })
        .catch(swallowCancellation)
        .catch(err => {
          if(err.message != 'Request failed with status code 404'){
            console.error(`Error when requesting child terms: ${err.message}.`, err);
            this.setLastError(err)
          }
        })
      })
    }
  }
};
</script>

<style scoped>
.browser-data-table >>> .v-data-table__wrapper {
    position: absolute;
    top: 0;
    bottom: 59px;
    width: 100%;
}

.browser-data-table >>> .v-data-table-header th {
    white-space: nowrap;
}

.browser-data-table >>> .v-data-footer {
    background: white;
    position: fixed;
    width: v-bind('tableWidth');
    bottom: 0;
    right: 0;
    margin-right: 0 !important;
}

.expand-all-button {
    text-transform: none;
    margin-left: -7.5px;
}

.emoticon {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: black;
}
</style>