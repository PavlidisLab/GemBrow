<template>
    <DataPage
            :title="title"
            :headers="headers"
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
      headers: [
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
        }
      ],
      lName: "platforms",
      sName: "pfs"
    };
  }
};
</script>
