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
    >
        <template slot="settingsForm">
            <v-layout row wrap>
                <v-switch v-model="troubled_on" label="Usability"/>
                <v-checkbox v-model="troubled" :disabled="!troubled_on"
                            :label="troubled_on ? ('Only '+(troubled ? 'usable':'unusable')) : 'All'"/>
            </v-layout>
            <v-divider/>

            <v-layout row wrap>
                <v-switch v-model="attention_on" label="Curation"/>
                <v-checkbox v-model="attention" :disabled="!attention_on"
                            :label="attention_on ? ('Only '+(+attention ? 'curated':'uncurated')) : 'All'"/>
            </v-layout>
            <v-divider/>

            <v-layout row wrap>
                <v-switch v-model="publication_on" label="Publication"/>
                <v-checkbox v-model="publication" :disabled="!publication_on"
                            :label="publication_on ? (publication ? 'available' : 'unknown') : 'all' "/>
            </v-layout>
            <v-divider/>

            <v-switch v-model="score_q_min_on" label="Min. quality"/>
                <v-slider v-show="score_q_min_on" :label="score_q_min.toFixed(1).toString()" :disabled="!score_q_min_on" v-model="score_q_min"
                          thumb-label step="0.1" ticks min="-1" max="1"></v-slider>
            <v-divider/>

            <v-switch v-model="score_s_min_on" label="Min. suitability"/>
                <v-slider v-show="score_s_min_on" :label="score_s_min.toFixed(1).toString()" :disabled="!score_s_min_on" v-model="score_s_min"
                          step="0.1" ticks min="-1" max="1"></v-slider>
            <v-divider/>

            <v-switch v-model="platform_amount_on" label="Min. platforms"/>
            <v-slider v-show="platform_amount_on" :label="platform_amount.toString()" :disabled="!platform_amount_on" v-model="platform_amount"
                      step="1" ticks min="1" max="3"></v-slider>
            <v-divider/>
                <SelectorTaxon
                    :taxa="taxa"
                    :storeName="sName"
                />
            <v-divider/>
        </template>
    </DataPage>
</template>

<script>
import DataPage from "../components/DataPage/DataPage";
import SelectorTaxon from "../components/DataPage/SelectorTaxon";
import moment from "moment";
import viewUtils from "../components/ViewUtils";
import { mapState } from "vuex";

export default {
  components: {
    DataPage: DataPage,
    SelectorTaxon: SelectorTaxon
  },
  data() {
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
      ]
    };
  },
  computed: {
    ...mapState({
      taxa: state => state.api.taxa
    }),
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
        return this.$store.state.dss.publication;
      },
      set(value) {
        this.$store.dispatch("dss/setPublication", value);
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
    }
  }
};
</script>
