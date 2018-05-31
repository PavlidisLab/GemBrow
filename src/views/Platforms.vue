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
import DataPage from "../components/DataPage";
import moment from "moment";

export default {
  components: {
    DataPage: DataPage
  },
  data() {
    return {
      title: "Platform Browser",
      cols: [
        {
          text: "ID",
          value: "id",
          show: true,
          renderer(props) {
            return props.item.id.toString();
          }
        },
        {
          text: "Accession",
          value: "shortName",
          show: true,
          renderer(props) {
            return props.item.shortName;
          }
        },
        {
          text: "Name",
          value: "name",
          show: true,
          renderer(props) {
            return props.item.name;
          }
        },
        {
          text: "Taxon",
          value: "taxon",
          show: true,
          renderer(props) {
            return props.item.taxon;
          }
        },
        {
          text: "Updated",
          value: "lastUpdated",
          show: true,
          renderer(props) {
            return moment.unix(props.item.lastUpdated / 1000).format("L");
          }
        }
      ],
      lName: "platforms",
      sName: "pfs"
    };
  }
};
</script>
