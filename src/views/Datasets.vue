<!--suppress JSIgnoredPromiseFromCall, JSUnresolvedVariable -->
<template>
    <DataPage
            :title="title"
            :cols="cols"
            :detail-rows="detailRows"
            :s-name="sName"
            :l-name="lName"
            :c-name="cName"
            :sort-mapping="mapSort"
            :pre-refresh-prop="search_on ? 'datasetSearch' : null"
            :pre-refresh-func-param="datasetKeywordSearchParams"
    >
        <template slot="settingsForm">
            <div>
                <v-layout row wrap>
                    <v-flex xs-12>
                        <v-switch v-model="search_on" label="Keywords"/>
                    </v-flex>
                    <v-tooltip top v-if="search_on">
                        <v-btn slot="activator" large round flat icon class="grey darken-2" color="red lighten-4" v-on:click="clearSearch()">
                            <v-icon>mdi-tag-remove</v-icon>
                        </v-btn>
                        Clear keywords
                    </v-tooltip>
                </v-layout>
                <v-select
                        class="search"
                        v-if="search_on" :disabled="!search_on"
                        v-model="search_query"
                        placeholder="Add keywords"
                        tags multiple chips solo dense flat autocomplete cache-items return-object
                        max-height="40%"
                        :append-icon=" keywordsPending ? 'mdi-sync mdi-spin' : '' "
                        :append-icon-cb="null"
                        item-text="value"
                        :items="keywordsFiltered"
                        :search-input.sync="annot_search"
                >
                    <template slot="selection" slot-scope="data">
                        <v-chip class="keyword chip"
                                close light small
                                :selected="data.selected"
                                :color="getChipColor(data.item)"
                                @input="data.parent.selectItem(data.item)"
                        >
                            <strong>{{ data.item.value }}</strong>
                        </v-chip>
                    </template>
                    <template slot="item" slot-scope="data">
                        <v-tooltip left style="width: 100%">
                            <v-layout slot="activator" row wrap class="select row">
                                <span class="label">
                                    <strong>{{ data.item.value }}</strong>
                                </span>
                                <v-spacer/>
                                <v-tooltip top>
                                    <v-icon slot="activator" right v-if="data.item.typeBiomaterial">mdi-dna</v-icon>
                                    Used in biomaterials
                                </v-tooltip>
                                <v-tooltip top>
                                    <v-icon slot="activator" right v-if="data.item.typeTag">mdi-tag-outline</v-icon>
                                    Used as a dataset tag
                                </v-tooltip>
                                <v-tooltip top>
                                    <v-icon slot="activator" right v-if="data.item.typeFactorValue">mdi-flask-outline</v-icon>
                                    Used as a factor value
                                </v-tooltip>
                            </v-layout>
                            <span>{{ data.item.category }}&nbsp;{{data.item.valueUri}}</span>
                        </v-tooltip>
                    </template>
                </v-select>
            </div>
            <v-divider v-if="search_on"/>

            <v-layout row wrap v-if="this.user && this.user.isAdmin">
                <v-switch v-model="troubled_on" label="Usability"/>
                <v-checkbox v-model="troubled" v-if="troubled_on" :disabled="!troubled_on"
                            :label="troubled_on ? ('Only '+(troubled ? 'usable':'unusable')) : 'All'"/>
            </v-layout>

            <v-layout row wrap>
                <v-switch v-model="attention_on" label="Curation"/>
                <v-checkbox v-model="attention" v-if="attention_on" :disabled="!attention_on"
                            :label="attention_on ? ('Only '+(+attention ? 'curated':'unfinished')) : 'All'"/>
            </v-layout>

            <v-layout row wrap v-if="this.user && this.user.isAdmin">
                <v-switch v-model="publication_on" label="Publication"/>
                <v-checkbox v-model="publication" v-if="publication_on" :disabled="!publication_on"
                            :label="publication_on ? ('Only '+(publication ? 'available' : 'unknown')) : 'all' "/>
            </v-layout>

            <div>
                <v-switch v-model="score_q_min_on" label="Min. quality"/>
                    <v-slider v-show="score_q_min_on" :label="score_q_min.toFixed(1).toString()" :disabled="!score_q_min_on" v-model="score_q_min"
                              thumb-label step="0.1" ticks min="-1" max="1"></v-slider>
            </div>
            <v-divider v-if="score_q_min_on"/>

            <div v-if="this.user && this.user.isAdmin">
                <v-switch v-model="score_s_min_on" label="Min. suitability" />
                    <v-slider v-show="score_s_min_on" :label="score_s_min.toFixed(1).toString()" :disabled="!score_s_min_on" v-model="score_s_min"
                              step="0.1" ticks min="-1" max="1"></v-slider>
            </div>
            <v-divider v-if="this.user && this.user.isAdmin && score_s_min_on"/>

            <div>
                <v-switch v-model="platform_amount_on" label="Min. platforms"/>
                <v-slider v-show="platform_amount_on" :label="platform_amount.toString()" :disabled="!platform_amount_on" v-model="platform_amount"
                          step="1" ticks min="1" max="3"></v-slider>
            </div>
            <v-divider v-if="platform_amount_on"/>

            <div >
                <SelectorTaxon
                    :taxa="taxa"
                    :storeName="sName"
                />
            </div>
            <v-divider/>
        </template>
    </DataPage>
</template>

<script>
import Vue from "vue";
import DataPage from "../components/DataPage/DataPage";
import SelectorTaxon from "../components/DataPage/SelectorTaxon";
import { _keywords } from "../assets/Characteristics.js";
import moment from "moment";
import viewUtils from "../components/ViewUtils";
import { mapState } from "vuex";

export default {
  components: {
    DataPage: DataPage,
    SelectorTaxon: SelectorTaxon
  },
  data: function() {
    return {
      title: "Dataset Browser",
      lName: "datasets",
      sName: "dss",
      cName: "dsc",
      detailRows: [
        {
          label: "Samples:",
          renderer(props) {
            return props.item.bioAssayCount;
          }
        },
        {
          label: "Profiles:",
          renderer(props) {
            return props.item.processedExpressionVectorCount;
          }
        }
      ],
      cols: [
        {
          text: "ID",
          value: "id",
          tip: "The Gemma ID of the Dataset. For internal use only.",
          adminOnly: true,
          renderer(props) {
            return props.item.id.toString();
          }
        },
        {
          text: "Accession",
          value: "shortName",
          tip: "The GEO accession or a short name of the dataset.",
          renderer(props) {
            return props.item.shortName;
          }
        },
        {
          text: "Name",
          value: "name",
          tip: "The full name of the dataset.",
          renderer(props) {
            return props.item.name;
          }
        },
        {
          text: "Taxon",
          value: "taxon",
          tip: "The taxon of the dataset samples.",
          renderer(props) {
            return viewUtils.methods.capitalize(props.item.taxon);
          }
        },
        {
          text: "Updated",
          value: "lastUpdated",
          tip: "The date the dataset was last changed within Gemma.",
          renderer(props) {
            return moment.unix(props.item.lastUpdated / 1000).format("L");
          }
        },
        {
          text: "Platforms",
          value: "arrayDesignCount",
          tip: "The amount of usable platforms the dataset uses.",
          renderer(props) {
            return props.item.arrayDesignCount.toString();
          }
        },
        {
          text: "Curation",
          value: "needsAttention",
          tip:
            "Displays a warning icon if the dataset curation is not finished.",
          rowTip(props) {
            return props.item.needsAttention
              ? "Curation not finished"
              : "Curated";
          },
          icon(props) {
            return props.item.needsAttention
              ? "mdi-alert-circle-outline"
              : "mdi-checkbox-marked-circle-outline";
          },
          iconColor(props) {
            return props.item.needsAttention ? "warning" : "success";
          }
        },
        {
          text: "Usability",
          value: "troubled",
          tip:
            "Displays a warning icon if the dataset is unusable for any reason.",
          adminOnly: true,
          rowTip(props) {
            return props.item.troubled ? "Unusable" : "Usable";
          },
          icon(props) {
            return props.item.troubled ? "warning" : "check_circle";
          },
          iconColor(props) {
            return props.item.troubled ? "error" : "success";
          }
        },
        {
          text: "Quality",
          value: "geeq.publicQualityScore",
          tip: "The quality score of the dataset.",
          rowTip(props) {
            return props.item.geeq.publicQualityScore.toFixed(1);
          },
          icon(props) {
            return viewUtils.methods.scoreToIcon(
              props.item.geeq.publicQualityScore
            );
          },
          iconStyle(props) {
            return (
              "background-color: " +
              viewUtils.methods.scoreToColor(props.item.geeq.publicQualityScore)
            );
          },
          iconClass() {
            return "score";
          }
        },
        {
          text: "Suitability",
          value: "geeq.publicSuitabilityScore",
          tip: "The suitability score of the dataset.",
          adminOnly: true,
          rowTip(props) {
            return props.item.geeq.publicSuitabilityScore.toFixed(1);
          },
          icon(props) {
            return viewUtils.methods.scoreToIcon(
              props.item.geeq.publicSuitabilityScore
            );
          },
          iconStyle(props) {
            return (
              "background-color: " +
              viewUtils.methods.scoreToColor(
                props.item.geeq.publicSuitabilityScore
              )
            );
          },
          iconClass() {
            return "score";
          }
        },
        {
          text: "Gemma",
          value: "gLink",
          tip: "Show dataset details page in Gemma",
          link(props) {
            return (
              "https://gemma.msl.ubc.ca/expressionExperiment/showExpressionExperiment.html?id=" +
              props.item.id.toString()
            );
          },
          icon() {
            return "mdi-open-in-new";
          }
        }
      ],
      annot_search: null,
      keywords: _keywords
    };
  },
  watch: {
    annot_search(val) {
      val && this.searchAnnotations(val);
    },
    annotations() {
      this.keywords = _keywords.concat(this.annotations);
    },
    foundDatasetsForKeywords(val) {
      let ids = [0];

      for (let i = 0; i < val.length; i++) {
        const dataset = val[i];
        ids.push(dataset.id);
      }

      this.$store.dispatch("dss/setIds_on", ids.length > 0);
      this.$store.dispatch("dss/setIds", ids);
    }
  },
  computed: {
    ...mapState({
      taxa: state => state.api.taxa,
      user: state => state.main.user,
      keywordsPending: state => state.api.pending.annotations,
      annotations: state => state.api.annotations,
      foundDatasetsForKeywords: state => state.api.datasetSearch
    }),
    datasetKeywordSearchParams: {
      get() {
        const kwrds = this.$store.state.dss.search_query;
        let query = "";
        for (let i = 0; i < kwrds.length; i++) {
          const kwrd = kwrds[i];
          if (kwrd.valueUri) {
            query += encodeURIComponent(kwrd.valueUri) + ",";
          } else {
            query += kwrd.value + ",";
          }
        }
        return query;
      }
    },
    keywordsFiltered: {
      get() {
        let keywords = [];
        for (let i = 0; i < this.keywords.length; i++) {
          let keyword = this.keywords[i];
          if (!this.search_query.includes(keyword)) {
            keywords.push(keyword);
          }
        }
        return keywords;
      }
    },
    troubled: {
      get() {
        return !this.$store.state.dss.troubled;
      },
      set(value) {
        this.$store.dispatch("dss/setTroubled", !value);
      }
    },
    attention: {
      get() {
        return !this.$store.state.dss.attention;
      },
      set(value) {
        this.$store.dispatch("dss/setAttention", !value);
      }
    },
    troubled_on: {
      get() {
        return this.$store.state.dss.troubled_on;
      },
      set(value) {
        this.$store.dispatch("dss/setTroubled_on", value);
      }
    },
    attention_on: {
      get() {
        return this.$store.state.dss.attention_on;
      },
      set(value) {
        this.$store.dispatch("dss/setAttention_on", value);
      }
    },
    score_q_min_on: {
      get() {
        return this.$store.state.dss.score_q_min_on;
      },
      set(value) {
        this.$store.dispatch("dss/setScore_q_min_on", value);
      }
    },
    score_q_min: {
      get() {
        return this.$store.state.dss.score_q_min;
      },
      set(value) {
        this.$store.dispatch("dss/setScore_q_min", value);
      }
    },
    score_s_min_on: {
      get() {
        return this.$store.state.dss.score_s_min_on;
      },
      set(value) {
        this.$store.dispatch("dss/setScore_s_min_on", value);
      }
    },
    score_s_min: {
      get() {
        return this.$store.state.dss.score_s_min;
      },
      set(value) {
        this.$store.dispatch("dss/setScore_s_min", value);
      }
    },
    publication_on: {
      get() {
        return this.$store.state.dss.publication_on;
      },
      set(value) {
        this.$store.dispatch("dss/setPublication_on", value);
      }
    },
    publication: {
      get() {
        return this.$store.state.dss.publication > 0;
      },
      set(value) {
        this.$store.dispatch("dss/setPublication", value ? 1 : -1);
      }
    },
    platform_amount_on: {
      get() {
        return this.$store.state.dss.platform_amount_on;
      },
      set(value) {
        this.$store.dispatch("dss/setPlatform_amount_on", value);
      }
    },
    platform_amount: {
      get() {
        const value = this.$store.state.dss.platform_amount;
        return value === 1 ? 1 : value === -0.5 ? 2 : 3;
      },
      set(value) {
        const setVal = value === 1 ? 1 : value === 2 ? -0.5 : -1;
        this.$store.dispatch("dss/setPlatform_amount", setVal);
      }
    },
    search_on: {
      get() {
        return this.$store.state.dss.search_on;
      },
      set(value) {
        this.$store.dispatch("dss/setSearch_on", value);
        if (!value) {
          this.$store.dispatch("dss/setIds_on", value);
        }
      }
    },
    search_query: {
      get() {
        return this.$store.state.dss.search_query;
      },
      set(value) {
        let newSearch = [];
        for (let i = 0; i < value.length; i++) {
          let item = value[i];
          if (!item.valueUri && !item.typeFreeText) {
            item = {
              value: item,
              typeFreeText: true
            };
          }
          newSearch.push(item);
        }

        this.$store.dispatch("dss/setSearch_query", newSearch);
        this.$store.dispatch("dss/setIds_on", newSearch.length > 0);
      }
    }
  },
  methods: {
    mapSort(sort) {
      if (sort === "geeq.publicQualityScore")
        sort = "geeq.detectedQualityScore";
      else if (sort === "geeq.publicSuitabilityScore")
        sort = "geeq.detectedSuitabilityScore";
      else if (
        sort === "troubled" ||
        sort === "needsAttention" ||
        sort === "lastUpdated"
      )
        sort = "curationDetails." + sort;
      else if (sort === "arrayDesignCount") {
        sort = "ad.size";
      }
      return sort;
    },
    clearSearch() {
      this.search_query = [];
    },
    searchAnnotations: Vue._.debounce(function(val) {
      this.$store.dispatch("api/getannotations", {
        params: val
      });
    }, 500),
    getChipColor(item) {
      if (item.typeFreeText) {
        return "purple accent-1";
      } else if (
        !item.typeFactorValue &&
        !item.typeTag &&
        !item.typeBiomaterial
      ) {
        return "teal accent-2";
      }
    }
  }
};
</script>

<style lang="scss">
@import "../assets/const";

div.input-group.search {
  margin-top: $dim2;
  padding-top: $dim2;
  padding-bottom: $dim2;
}
.select.row {
  overflow: hidden;
  max-height: 40px;
}

.select.row .label {
  width: 70%;
  max-width: 70%;
  text-align: left;
}

.keyword.chip strong {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
