<template>
    <v-container>
        <v-row>
            <v-col cols="3">
                <SearchSettings v-model="searchSettings" :disabled="loading"
                                :technology-types="technologyTypes"
                                :taxa="taxa"
                                :platforms="platforms"
                                :annotations="annotations"/>
            </v-col>
            <v-col cols="9">
                <v-alert v-show="errorMessage" type="error">
                    <div v-html="errorMessage"></div>
                </v-alert>
                <v-data-table title="Search Results"
                              loading-text="We're working hard on your query..."
                              no-data-text="Put something in the search bar to get some results."
                              no-results-text="Nothing was found! Try to make your search less specific."
                              :loading="loading"
                              :headers="headers"
                              :items="datasets"
                              :options="options"
                              :footer-props="{pagination: this.datasetsPagination}"
                >
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
                            Dispatched query:
                            <pre style="white-space: pre-wrap">{{ dispatchedFilter || "Everything" }}</pre>
                        </div>
                        Applied query:
                        <pre style="white-space: pre-wrap;">{{ filterApplied || "Everything" }}</pre>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import SearchSettings from "@/components/SearchSettings";
import { ExpressionExperimentType, SearchSettings as SearchSettingsModel } from "@/models";
import debounce from "lodash/debounce";
import { mapState } from "vuex";
import gemmaConfig from "@/config/gemma";
import { groupBy, sumBy } from "lodash";

function quoteIfNecessary(s) {
  if (s.match(/[(), ]/)) {
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
      errorMessage: null,
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
      options: {},
      dispatchedFilter: "",
      baseUrl: gemmaConfig.baseUrl
    };
  },
  methods: {
    search: debounce(function() {
      if (this.loading) {
        this.errorMessage = "There's already pending search! We need support for cancellation (see <a href=\"https://github.com/PavlidisLab/GemBrow/issues/16\">#16</a> for details).";
        console.log("Pending search...");
        return;
      }
      const f = this.filter;
      console.log("Dispatching search for " + f + " now...");
      this.dispatchedFilter = f;
      if (this.searchSettings.query.length > 0) {
        this.$store.dispatch("api/search", {
          params: this.searchSettings
        }).then(() => {
          this.browse(f);
        }).catch((err) => {
          this.errorMessage = "Yikes! There were some issues reaching Gemma API. " + err;
          console.error(err);
        });
      } else {
        return this.browse(f);
      }
    }, 500),
    browse: function(f) {
      // update available annotations and number of datasets
      let updateDatasetsPromise = this.$store.dispatch("api/getDatasets", {
        params: {
          filter: f,
          offset: 0,
          limit: 15
        }
      });
      let updateDatasetsAnnotationsPromise = this.$store.dispatch("api/getDatasetsAnnotations", {
        params: {
          filter: f
        }
      });
      return Promise.all([updateDatasetsPromise, updateDatasetsAnnotationsPromise]);
    },
    updateOpenApiSpecification: function() {
      return this.$store.dispatch("api/getOpenApiSpecification");
    },
    updateAvailableTaxa() {
      return this.$store.dispatch("api/getTaxa");
    },
    updateAvailablePlatforms() {
      let params = {};
      if (this.taxon) {
        params.filter = "taxon = " + this.taxon.id;
      }
      params.limit = 100;
      return this.$store.dispatch("api/getPlatforms", { params: params });
    }
  },
  computed: {
    filter() {
      let filter = [];
      // TODO: push the dataset IDs
      if (this.searchSettings.query.length > 0) {
        filter.push(["id in (" + this.searchResults.data.map(sr => sr.resultId).join(", ") + ")"]);
      }
      if (this.searchSettings.platform) {
        filter.push(["bioAssays.arrayDesignUsed.id = " + this.searchSettings.platform.id]);
      }
      if (this.searchSettings.taxon) {
        filter.push(["taxon.id = " + this.searchSettings.taxon.id]);
      }
      if (this.searchSettings.technologyTypes.length > 0) {
        filter.push(["bioAssays.arrayDesignUsed.technologyType in (" + this.searchSettings.technologyTypes.map(quoteIfNecessary).join(", ") + ")"]);
      }
      if (this.searchSettings.annotations.length > 0) {
        let uris = this.searchSettings.annotations.map(a => a.split("|")[1]).map(quoteIfNecessary).join(", ");
        // we filter by annotations at three different level to match what the search does
        const props = [
          "characteristics.value",
          "characteristics.valueUri",
          "experimentalDesign.experimentalFactors.factorValues.characteristics.value",
          "experimentalDesign.experimentalFactors.factorValues.characteristics.valueUri",
          "bioAssays.sampleUsed.characteristics.value",
          "bioAssays.sampleUsed.characteristics.valueUri"];
        filter.push(props.map(prop => prop + " in (" + uris + ")"));
      }
      return filter.map(a => a.join(" or ")).join(" and ");
    },
    ...mapState({
      searchResults: state => state.api.search,
      datasets: state => state.api.datasets.data || [],
      datasetsPagination: state => {
        return {
          itemsPerPage: state.api.datasets.limit,
          pageStart: state.api.datasets.offset,
          pageStop: state.api.datasets.offset + state.api.datasets.limit,
          pageCount: state.api.datasets.totalElements / state.api.datasets.limit,
          itemsLength: state.api.datasets.totalElements
        };
      },
      filterApplied: state => state.api.datasets.filter,
      totalElements: state => state.api.datasets.totalElements,
      openApiSpecification: state => state.api.openApiSpecification,
      technologyTypes(state) {
        const filterableProperties = state.api.openApiSpecification.components.schemas["FilterArgExpressionExperiment"]["x-gemma-filterable-properties"];
        const technologyTypes = filterableProperties.find(prop => prop.name === "bioAssays.arrayDesignUsed.technologyType");
        return technologyTypes["availableValues"].map(elem => {
          return { id: elem.value, label: elem.name };
        });
      },
      /**
       * Check if there is a pending search.
       * TODO: handle search cancellation
       */
      loading: state => state.api.pending["search"] || state.api.pending["datasets"] || state.api.pending["datasetsAnnotations"],
      platforms: state => state.api.platforms.data,
      taxa: state => state.api.taxa.data,
      annotations(state) {
        // first grouping by category
        let termsByCategory = groupBy(state.api.datasetsAnnotations.data, elem => (elem.classUri || elem.className)?.toLowerCase());
        let annotations = [];
        for (let key in termsByCategory) {
          annotations.push({
            id: key,
            isCategory: true,
            children: termsByCategory[key].map((elem) => {
              return {
                id: `${key}|${elem.termUri || elem.termName}`.toLowerCase(),
                isCategory: false,
                ...elem
              };
            }),
            classUri: termsByCategory[key].find(el => el.classUri !== null)?.classUri,
            className: termsByCategory[key].find(el => el.className !== null)?.className,
            numberOfExpressionExperiments: sumBy(termsByCategory[key], elem => elem.numberOfExpressionExperiments)
          });
        }
        return annotations;
      }
    })
  },
  created() {
    // dispatch an empty search immediately to get some results
    Promise.all([this.search(),
      this.updateOpenApiSpecification(),
      this.updateAvailableTaxa(),
      this.updateAvailablePlatforms()]).then(() => {
      console.log("Initialization completed!");
    });
  },
  watch: {
    searchSettings: {
      handler: function() {
        this.search();
      },
      deep: true
    },
    loading: function(newVal) {
      console.log("Loading is now " + newVal);
    },
    taxon() {
      this.updateAvailablePlatforms();
    }
  }
};
</script>

<style scoped>

</style>