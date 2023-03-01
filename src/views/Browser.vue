<template>
    <div>
        <v-container fluid>
            <v-row>
                <v-col cols="3" class="fill-height">
                    <v-navigation-drawer permanent width="100%">
                        <SearchSettings v-model="searchSettings" :disabled="loading"
                                        :technology-types="technologyTypes"
                                        :taxa="taxa"
                                        :platforms="datasetsPlatforms"
                                        :annotations="datasetsAnnotations"
                                        :total-number-of-expression-experiments="totalNumberOfExpressionExperiments"/>
                    </v-navigation-drawer>
                </v-col>
                <v-col>
                    <v-alert v-for="(error, key) in errors" :key="key" type="error">
                        <div v-html="error"></div>
                    </v-alert>
                    <v-alert v-show="reloadAttempt" type="warning">
                        There's already pending search! We need support for cancellation (see <a
                            href="https://github.com/PavlidisLab/GemBrow/issues/16">#16</a> for details).
                    </v-alert>
                    <v-data-table title="Search Results"
                                  loading-text="We're working hard on your query..."
                                  no-data-text="Put something in the search bar to get some results."
                                  no-results-text="Nothing was found! Try to make your search less specific."
                                  :loading="loading"
                                  :headers="headers"
                                  :items="datasets"
                                  :page.sync="page"
                                  :sort-by.sync="sortBy"
                                  :sort-desc.sync="sortDesc"
                                  :items-per-page.sync="itemsPerPage"
                                  :footer-props="footerProps"
                                  :disable-sort="loading"
                                  :disable-pagination="loading"
                                  dense>
                        <template v-slot:item.shortName="{item}">
                            <a :href="baseUrl + '/expressionExperiment/showExpressionExperiment.html?id=' + item.id">{{
                                    item.shortName
                                }}</a>
                        </template>
                        <template v-slot:item.resultObject="{item}">
                            <span>{{ item }}</span>
                        </template>
                        <template v-slot:item.description="{item}">
                            {{ item.description.substring(0, 150) }}
                        </template>
                        <template v-slot:item.lastUpdated="{item}">
                            {{ new Date(item.lastUpdated).toLocaleDateString() }}
                        </template>
                    </v-data-table>
                    <v-card>
                        <v-card-text>
                            <div v-if="loading">
                                Pending requests:
                                <v-chip v-for="(e, index) in loadingEndpoints" :key="index">{{ e }}</v-chip>
                                <br/>
                                Dispatched query:
                                <pre style="white-space: pre-wrap">{{
                                        dispatchedBrowsingOptions.filter || "Everything"
                                    }}</pre>
                                <span>Sort: {{ dispatchedBrowsingOptions.sort }}</span><br/>
                                <span>Offset: {{ dispatchedBrowsingOptions.offset }}</span><br/>
                                <span>Limit: {{ dispatchedBrowsingOptions.limit }}</span>
                            </div>
                            <div v-if="appliedBrowsingOptions">
                                Applied query:
                                <pre style="white-space: pre-wrap;">{{
                                        appliedBrowsingOptions.filter || "Everything"
                                    }}</pre>
                                <span>Sort: {{ appliedBrowsingOptions.sort }}</span><br/>
                                <span>Offset: {{ appliedBrowsingOptions.offset }}</span><br/>
                                <span>Limit: {{ appliedBrowsingOptions.limit }}</span>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
import SearchSettings from "@/components/SearchSettings";
import { ExpressionExperimentType, SearchSettings as SearchSettingsModel } from "@/models";
import debounce from "lodash/debounce";
import { mapState } from "vuex";
import gemmaConfig from "@/config/gemma";
import { groupBy, sumBy } from "lodash";

function quoteIfNecessary(s) {
  if (s.match(/[(), ]/) || s.length === 0) {
    return "\"" + s.replaceAll("\"", "\\") + "\"";
  } else {
    return s;
  }
}

export default {
  name: "Browser",
  components: { SearchSettings },
  data() {
    return {
      searchSettings: new SearchSettingsModel("", [ExpressionExperimentType]),
      page: 1,
      itemsPerPage: 25,
      sortBy: "id",
      sortDesc: false,
      headers: [
        {
          text: "Short name",
          value: "shortName"
        },
        {
          text: "Description",
          value: "description"
        },
        {
          text: "Last Updated",
          value: "lastUpdated"
        }
      ],
      dispatchedBrowsingOptions: "",
      baseUrl: gemmaConfig.baseUrl,
      reloadAttempt: false
    };
  },
  computed: {
    filter() {
      let filter = [];
      // TODO: push the dataset IDs
      if (this.searchSettings.query.length > 0 && this.searchResults.data) {
        filter.push(["id in (" + this.searchResults.data.map(sr => sr.resultId).join(", ") + ")"]);
      }
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
      if (this.searchSettings.annotations.length > 0) {
        let c = new Set(this.searchSettings.categories);

        // check if all categories are picked
        let categoryUris = this.searchSettings.categories.map(quoteIfNecessary).join(", ");

        if (categoryUris.length > 100) {
          console.error("Too many category URIs (" + categoryUris.length + ") in clause.");
        } else if (categoryUris) {
          const categoryProps = [
            "allCharacteristics.category",
            "allCharacteristics.categoryUri"];
          filter.push(categoryProps.map(prop => prop + " in (" + categoryUris + ")"));
        }

        let annotationUris = this.searchSettings.annotations
          .filter(a => !c.has(a.split("|")[0])) // exclude terms which are covered by a category URI
          .map(a => a.split("|")[1])
          .map(quoteIfNecessary).join(", ");
        if (annotationUris.length > 100) {
          console.error("Too many term URIs (" + annotationUris.length + ") in clause.");
        } else if (annotationUris) {
          const props = [
            "allCharacteristics.value",
            "allCharacteristics.valueUri"];
          filter.push(props.map(prop => prop + " in (" + annotationUris + ")"));
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
      return {
        filter: this.filter,
        sort: (this.sortDesc ? "-" : "+") + this.sortBy,
        offset: (this.page - 1) * this.itemsPerPage,
        limit: this.itemsPerPage
      };
    },
    ...mapState({
      errors: state => Object.values(state.api.error).filter(e => e !== null).map(e => e.response.data?.error?.message || e.message),
      searchResults: state => state.api.search,
      datasets: state => state.api.datasets.data || [],
      totalNumberOfExpressionExperiments: state => state.api.datasets.totalElements,
      footerProps: state => {
        return {
          pagination: {
            page: 1, // Math.ceil(state.api.datasets.offset / state.api.datasets.limit),
            itemsPerPage: state.api.datasets.limit,
            pageStart: state.api.datasets.offset,
            pageStop: state.api.datasets.offset + state.api.datasets.limit,
            pageCount: 10, // Math.ceil(state.api.datasets.totalElements / state.api.datasets.limit),
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
        if (state.api.datasets) {
          return {
            filter: state.api.datasets.filter,
            sort: state.api.datasets.sort?.direction + state.api.datasets.sort?.orderBy,
            offset: state.api.datasets.offset,
            limit: state.api.datasets.limit
          };
        }
      },
      technologyTypes(state) {
        if (state.api.openApiSpecification) {
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
      loading: state => state.api.pending["search"] || state.api.pending["datasets"] || state.api.pending["datasetsAnnotations"],
      loadingEndpoints: state => Object.entries(state.api.pending).filter(e => e[1]).map(e => e[0]),
      datasetsPlatforms: state => state.api.datasetsPlatforms.data,
      taxa: state => state.api.taxa.data,
      datasetsAnnotations(state) {
        if (state.api.datasetsAnnotations.data === undefined) {
          return [];
        }
        // first grouping by category
        let filteredTerms = state.api.datasetsAnnotations.data
          .filter(elem => !gemmaConfig.blacklistedTerms.has(elem.classUri) && !gemmaConfig.blacklistedTerms.has(elem.termUri));
        let termsByCategory = groupBy(filteredTerms, elem => (elem.classUri || elem.className?.toLowerCase()));
        let annotations = [];
        for (let key in termsByCategory) {
          annotations.push({
            id: key,
            isCategory: true,
            children: termsByCategory[key].map((elem) => {
              return {
                id: `${key}|${elem.termUri || elem.termName?.toLowerCase()}`,
                isCategory: false,
                ...elem
              };
            }),
            classUri: termsByCategory[key].find(el => el.classUri !== null)?.classUri,
            className: termsByCategory[key].find(el => el.className !== null)?.className
          });
        }
        return annotations;
      }
    })
  },
  methods: {
    search: debounce(function(query, platform, taxon, resultTypes) {
      if (this.loading) {
        this.reloadAttempt = true;
        // FIXME
        return Promise.resolve(this.searchResults);
      }
      if (query.length > 0) {
        return this.$store.dispatch("api/search", {
          params: {
            query: query,
            platform: platform?.id,
            taxon: taxon?.id,
            resultTypes: resultTypes,
            exclude: "resultObject"
          }
        }).finally(() => {
          this.reloadAttempt = false;
        });
      } else {
        // TODO: clear search results
      }
    }, 500),
    browse: debounce(function(browsingOptions) {
      if (this.loading) {
        this.reloadAttempt = true;
        return Promise.resolve();
      }
      // update available annotations and number of datasets
      let updateDatasetsPromise = this.$store.dispatch("api/getDatasets", {
        params: browsingOptions
      });
      let updateDatasetsAnnotationsPromise = this.updateAvailableAnnotations(browsingOptions.filter);
      let updateDatasetsPlatformsPromise = this.updateAvailablePlatforms(browsingOptions.filter);
      this.dispatchedBrowsingOptions = browsingOptions;
      return Promise.all([updateDatasetsPromise, updateDatasetsAnnotationsPromise, updateDatasetsPlatformsPromise])
        .finally(() => {
          this.reloadAttempt = false;
        });
    }, 500),
    updateAvailableAnnotations(filter) {
      return this.$store.dispatch("api/getDatasetsAnnotations", {
        params: {
          filter: filter,
          minFrequency: filter.length > 0 ? 10 : 0,
          limit: 1000
        }
      });
    },
    updateOpenApiSpecification() {
      return this.$store.dispatch("api/getOpenApiSpecification");
    },
    updateAvailableTaxa() {
      return this.$store.dispatch("api/getTaxa");
    },
    updateAvailablePlatforms(filter) {
      return this.$store.dispatch("api/getDatasetsPlatforms", {
        params: {
          filter: filter
        }
      });
    }
  },
  created() {
    Promise.all([this.updateOpenApiSpecification(), this.updateAvailableTaxa(), this.updateAvailablePlatforms(this.filter), this.updateAvailableAnnotations(this.filter)])
      .then(() => {
        console.log("Initialization completed!");
        // dispatch an empty search immediately to get some results
        // this.browse(this.browsingOptions);
      }).catch(err => console.log(err));
  },
  watch: {
    "searchSettings.query": function(newVal) {
      this.search(newVal, this.searchSettings.taxon, this.searchSettings.platform, this.searchSettings.resultTypes);
    },
    "searchSettings.taxon": function() {
      this.updateAvailablePlatforms(this.filter);
    },
    "browsingOptions": function(newVal) {
      this.browse(newVal);
    }
  }
};
</script>

<style scoped>

</style>