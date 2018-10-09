<template>
    <DataPage
            :title="title"
            :s-name="sName"
            :l-name="lName"
            :c-name="cName"
            :cols="cols"
            :detail-rows="detailRows"
            :sort-mapping="mapSort"
    >
        <template slot="settingsForm">
            <v-layout row wrap v-if="this.user && this.user.isAdmin">
                <v-switch v-model="troubled_on" label="Usability"/>
                <v-checkbox v-model="troubled" :disabled="!troubled_on"
                            :label="troubled_on ? ('Only '+(troubled ? 'usable':'unusable')) : 'All'"/>
            </v-layout>
            <v-divider v-if="this.user && this.user.isAdmin"/>

            <v-layout row wrap>
                <v-switch v-model="attention_on" label="Curation"/>
                <v-checkbox v-model="attention" :disabled="!attention_on"
                            :label="attention_on ? ('Only '+(+attention ? 'curated':'uncurated')) : 'All'"/>
            </v-layout>
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
      title: "Platform Browser",
      lName: "platforms",
      sName: "pfs",
      cName: "pfc",
      detailRows: [
        {
          label: "Technology:",
          renderer(props) {
            return props.item.technologyType;
          }
        },
        {
          label: "Experiments:",
          renderer(props) {
            return props.item.expressionExperimentCount;
          }
        }
      ],
      cols: [
        {
          text: "ID",
          value: "id",
          tip: "The Gemma ID of the platform. For internal use only",
          adminOnly: true,
          renderer(props) {
            return props.item.id.toString();
          }
        },
        {
          text: "Accession",
          value: "shortName",
          tip: "The GEO accession or a short name of the platform.",
          renderer(props) {
            return props.item.shortName;
          }
        },
        {
          text: "Name",
          value: "name",
          tip: "The full name of the platform.",
          renderer(props) {
            return props.item.name;
          }
        },
        {
          text: "Taxon",
          value: "taxon",
          tip: "The taxon of the platform.",
          renderer(props) {
            return viewUtils.methods.capitalize(props.item.taxon);
          }
        },
        {
          text: "Updated",
          value: "lastUpdated",
          tip: "The date the platform was last changed within Gemma.",
          renderer(props) {
            return moment.unix(props.item.lastUpdated / 1000).format("L");
          }
        },
        {
          text: "Datasets",
          value: "arrayDesignCount",
          tip: "The amount of usable platforms the dataset uses.",
          renderer(props) {
            return props.item.expressionExperimentCount.toString();
          }
        },
        {
          text: "Curation",
          value: "needsAttention",
          tip:
            "Displays a warning icon if the platform curation is not finished.",
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
            "Displays a warning icon if the platform is unusable for any reason.",
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
          text: "Gemma",
          value: "gLink",
          tip: "Show platform details page in Gemma",
          link(props) {
            return (
              "https://gemma.msl.ubc.ca/arrays/showArrayDesign.html?id=" +
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
      taxa: state => state.api.taxa,
      user: state => state.main.user
    }),
    troubled: {
      get() {
        return !this.$store.state.pfs.troubled;
      },
      set(value) {
        this.$store.dispatch("pfs/setTroubled", !value);
      }
    },
    attention: {
      get() {
        return !this.$store.state.pfs.attention;
      },
      set(value) {
        this.$store.dispatch("pfs/setAttention", !value);
      }
    },
    troubled_on: {
      get() {
        return this.$store.state.pfs.troubled_on;
      },
      set(value) {
        this.$store.dispatch("pfs/setTroubled_on", value);
      }
    },
    attention_on: {
      get() {
        return this.$store.state.pfs.attention_on;
      },
      set(value) {
        this.$store.dispatch("pfs/setAttention_on", value);
      }
    },
    taxon_on: {
      get() {
        return this.$store.state.pfs.taxon_on;
      },
      set(value) {
        this.$store.dispatch("pfs/setTaxon_on", value);
      }
    },
    taxon: {
      get() {
        return this.$store.state.pfs.taxon;
      },
      set(value) {
        this.$store.dispatch("pfs/setTaxon", value);
      }
    }
  },
  methods: {
    mapSort(sort) {
      if (
        sort === "troubled" ||
        sort === "needsAttention" ||
        sort === "lastUpdated"
      )
        sort = "curationDetails." + sort;
      else if (sort === "expressionExperimentCount") {
        sort = "ee.size";
      } else if (sort === "taxon") {
        sort = "primaryTaxon";
      }
      return sort;
    }
  }
};
</script>
