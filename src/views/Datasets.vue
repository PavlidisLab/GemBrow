<template>
    <DataPage
            :title="title"
            :cols="cols"
            :s-name="sName"
            :l-name="lName"
    >
        <template slot="settingsForm">
            <v-layout row wrap>
                <v-switch v-model="troubled_on" label="Usability:"/>
                <v-checkbox v-model="troubled" :disabled="!troubled_on" :label="'Only '+(!troubled ? 'usable':'unusable')" />
            </v-layout>
            <v-divider/>
            <v-layout row wrap>
                <v-switch v-model="attention_on" label="Curation:"/>
                <v-checkbox v-model="attention" :disabled="!attention_on" :label="'Only '+(+!attention ? 'curated':'uncurated')" />
            </v-layout>
            <v-divider/>
            <v-switch v-model="score_q_min_on" label="Min. quality:"/>
                <v-slider :label="score_q_min.toFixed(1).toString()" :disabled="!score_q_min_on" v-model="score_q_min" thumb-label step="0.1" ticks min="-1" max="1"></v-slider>
            <v-divider/>
            <v-switch v-model="score_s_min_on" label="Min. suitability:"/>
                <v-slider :label="score_s_min.toFixed(1).toString()" :disabled="!score_s_min_on" v-model="score_s_min" step="0.1" ticks min="-1" max="1"></v-slider>
            <v-layout row wrap>
                <v-switch v-model="taxon_on" label="Only human"/>
                <!--<v-checkbox v-model="attention" :disabled="!attention_on" :label="'Only '+(+!attention ? 'curated':'uncurated')" />-->
            </v-layout>
        </template>
    </DataPage>
</template>

<script>
import DataPage from "../components/DataPage";
import moment from "moment";
import viewUtils from "../components/viewUtils";

export default {
  components: {
    DataPage: DataPage
  },
  data() {
    return {
      title: "Dataset Browser",
      cols: [
        {
          text: "ID",
          value: "id",
          tip: "The Gemma ID of the Dataset. For internal use only.",
          show: false,
          renderer(props) {
            return props.item.id;
          }
        },
        {
          text: "Accession",
          value: "shortName",
          tip: "The GEO accession or a short name of the dataset.",
          show: true,
          renderer(props) {
            return props.item.shortName;
          }
        },
        {
          text: "Name",
          value: "name",
          tip: "The full name of the dataset.",
          show: true,
          renderer(props) {
            return props.item.name;
          }
        },
        {
          text: "Taxon",
          value: "taxon",
          tip: "The taxon of the dataset samples.",
          show: true,
          renderer(props) {
            return props.item.taxon;
          }
        },
        {
          text: "Updated",
          value: "lastUpdated",
          tip: "The date the dataset was last changed within Gemma.",
          show: true,
          renderer(props) {
            return moment.unix(props.item.lastUpdated / 1000).format("L");
          }
        },
        {
          text: "Curation",
          value: "needsAttention",
          tip:
            "Displays a warning icon if the dataset curation is not finished.",
          show: true,
          renderer(props) {
            return props.item.needsAttention
              ? "<i aria-hidden='true' class='icon material-icons warning--text'>error</i>"
              : "<i aria-hidden='true' class='icon material-icons success--text'>check_circle_outline</i>";
          }
        },
        {
          text: "Usability",
          value: "troubled",
          tip:
            "Displays a warning icon if the dataset is unusable for any reason.",
          show: false,
          renderer(props) {
            return props.item.troubled
              ? "<i aria-hidden='true' class='icon material-icons error--text'>warning</i>"
              : "<i aria-hidden='true' class='icon material-icons success--text'>check_circle</i>";
          }
        },
        {
          text: "Quality",
          value: "geeq.publicQualityScore",
          tip: "The quality score of the dataset.",
          show: true,
          renderer(props) {
            return viewUtils.methods.renderScore(
              props.item.geeq.publicQualityScore
            );
          }
        },
        {
          text: "Suitability",
          value: "geeq.publicSuitabilityScore",
          tip: "The suitability score of the dataset.",
          show: true,
          renderer(props) {
            return viewUtils.methods.renderScore(
              props.item.geeq.publicSuitabilityScore
            );
          }
        }
      ],
      lName: "datasets",
      sName: "dss"
    };
  },
  computed: {
    troubled: {
      get() {
        return this.$store.state.dss.troubled;
      },
      set(value) {
        this.$store.dispatch("dss/setTroubled", value);
      }
    },
    attention: {
      get() {
        return this.$store.state.dss.attention;
      },
      set(value) {
        this.$store.dispatch("dss/setAttention", value);
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
        return this.$store.state.dss.taxon;
      },
      set(value) {
        this.$store.dispatch("dss/setPublication", value);
      }
    }
  }
};
</script>
