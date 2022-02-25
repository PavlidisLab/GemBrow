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
            download
    >
        <template slot="settingsForm">
            <v-layout row wrap v-if="this.user && this.user.isAdmin">
                <v-switch v-model="troubled_on" label="Usability"/>
                <v-checkbox
                        v-model="troubled"
                        v-if="troubled_on"
                        :disabled="!troubled_on"
                        :label="
            troubled_on ? 'Only ' + (troubled ? 'usable' : 'unusable') : 'All'
          "
                />
            </v-layout>

            <v-layout row wrap v-if="this.user && this.user.isAdmin">
                <v-switch v-model="attention_on" label="Curation"/>
                <v-checkbox
                        v-model="attention"
                        v-if="attention_on"
                        :disabled="!attention_on"
                        :label="
            attention_on
              ? 'Only ' + (+attention ? 'curated' : 'uncurated')
              : 'All'
          "
                />
            </v-layout>

            <div>
                <SelectorTaxon :taxa="taxa" :storeName="sName"/>
            </div>
            <v-divider/>
        </template>
        <template slot="settingsHelp">
            <HelpRow
                    v-if="this.user && this.user.isAdmin"
                    prop-name="help_troubled_on"
                    label="Usability"
            >
                <template slot="content">
                    Filter by usability. Either show only usable or only unusable
                    datasets.
                </template>
            </HelpRow>

            <HelpRow
                    v-if="this.user && this.user.isAdmin"
                    prop-name="help_attention_on"
                    label="Curation"
            >
                <template slot="content">
                    Filter by curation status. Either show only curated datasets, or
                    datasets that are still being curated (i.e. have the 'need curators
                    attention' flag on).
                </template>
            </HelpRow>

            <HelpRow prop-name="help_taxon_on" label="Taxon">
                <template slot="content">
                    Filter by taxon. Only show datasets that have samples for the selected
                    taxon.
                </template>
            </HelpRow>
            <v-container>
                Each filter creates a new restriction that will be applied after
                clicking the "Apply Filters" button.
            </v-container>
        </template>
    </DataPage>
</template>

<script>
import gemmaConfig from "../config/gemma";
import DataPage from "../components/DataPage/DataPage";
import SelectorTaxon from "../components/DataPage/SelectorTaxon";
import HelpRow from "../components/DataPage/HelpRow";
import viewUtils from "../components/ViewUtils";
import { mapState } from "vuex";

export default {
  components: {
    DataPage: DataPage,
    SelectorTaxon: SelectorTaxon,
    HelpRow: HelpRow
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
          label: "ID",
          value: "id",
          tip: "The Gemma ID of the platform. For internal use only",
          adminOnly: true,
          renderer(props) {
            return props.item.id ? props.item.id.toString() : "";
          }
        },
        {
          label: "Accession",
          value: "shortName",
          tip: "The GEO accession or a short name of the platform.",
          renderer(props) {
            return props.item.shortName;
          }
        },
        {
          label: "Name",
          value: "name",
          tip: "The full name of the platform.",
          renderer(props) {
            return props.item.name;
          }
        },
        {
          label: "Taxon",
          value: "taxon",
          tip: "The taxon of the platform.",
          renderer(props) {
            return props.item.taxon
              ? viewUtils.methods.capitalize(props.item.taxon)
              : "";
          }
        },
        {
          label: "Updated",
          value: "lastUpdated",
          tip: "The date the platform was last changed within Gemma.",
          renderer(props) {
            return props.item.lastUpdated
              ? new Date(props.item.lastUpdated).toLocaleString()
              : "";
          }
        },
        {
          label: "Datasets",
          value: "arrayDesignCount",
          tip: "The amount of usable platforms the dataset uses.",
          renderer(props) {
            return props.item.expressionExperimentCount
              ? props.item.expressionExperimentCount.toString()
              : "";
          }
        },
        {
          labelMain: "Curation",
          label: "Uncurated",
          value: "needsAttention",
          adminOnly: true,
          tip: "Displays a warning icon if the platform curation is not finished.",
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
          labelMain: "Usability",
          label: "Unusable",
          value: "troubled",
          tip: "Displays a warning icon if the platform is unusable for any reason.",
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
          label: "Gemma",
          value: "gLink",
          tip: "Show platform details page in Gemma",
          link(props) {
            return (
              gemmaConfig.baseUrl +
              "/arrays/showArrayDesign.html?id=" +
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
      taxa: (state) => state.api.taxa,
      user: (state) => state.main.user
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
