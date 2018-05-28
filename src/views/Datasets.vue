<template>
    <DataPage
            :title="title"
            :headers="cols"
            :s-name="sName"
            :l-name="lName"
    >
        <template slot="settingsForm">
            <v-checkbox v-model="troubled" label="Unusable"
                          single-line prepend-icon="warning"/>
            <v-checkbox v-model="attention" label="Needs attention"
                        single-line prepend-icon="error"/>
        </template>
    </DataPage>
</template>

<script>
import DataPage from "../components/DataPage";
import moment from "moment";

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
          renderer(props) {
            return props.item.id;
          }
        },
        {
          text: "Accession",
          value: "shortName",
          renderer(props) {
            return props.item.shortName;
          }
        },
        {
          text: "Name",
          value: "name",
          renderer(props) {
            return props.item.name;
          }
        },
        {
          text: "Taxon",
          value: "taxon",
          renderer(props) {
            return props.item.taxon;
          }
        },
        {
          text: "Updated",
          value: "lastUpdated",
          renderer(props) {
            return moment.unix(props.item.lastUpdated / 1000).format("L");
          }
        },
        {
          text: "Usability",
          value: "troubled",
          renderer(props) {
            return props.item.troubled
              ? "<i aria-hidden='true' class='icon material-icons error--text'>warning</i>"
              : "<i aria-hidden='true' class='icon material-icons success--text'>check_circle</i>";
          }
        },
        {
          text: "Attention",
          value: "needsAttention",
          renderer(props) {
            return props.item.needsAttention
              ? "<i aria-hidden='true' class='icon material-icons warning--text'>error</i>"
              : "<i aria-hidden='true' class='icon material-icons success--text'>check_circle_outline</i>";
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
    }
  }
};
</script>
