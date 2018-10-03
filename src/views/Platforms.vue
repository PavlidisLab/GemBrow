<template>
    <DataPage
            :title="title"
            :s-name="sName"
            :l-name="lName"
            :cols="cols"
    >
        <template slot="settingsForm">
            <v-text-field v-model="this.$store.state.pfs.limit" required :rules="[v => !!v || 'Must be filled in!']"
                          label="Limit amount"
                          single-line prepend-icon="unfold_less"/>
        </template>
    </DataPage>
</template>

<script>
import DataPage from "../components/DataPage/DataPage";
import moment from "moment";
import viewUtils from "../components/ViewUtils";
import { mapState } from "vuex";

export default {
  components: {
    DataPage: DataPage
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
  }
};
</script>
