<template>
    <DataPage
            :title="title"
            :headers="headers"
            :s-name="sName"
            :l-name="lName"
            :cols="cols"
    >
        <template slot="settingsForm">
            <v-text-field v-model="this.$store.state.dss.limit" required :rules="[v => !!v || 'Must be filled in!']" label="Limit amount"
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
      title: "Dataset Browser",
      headers: [
        { text: "ID", value: "id" },
        { text: "Accession", value: "shortName" },
        { text: "Name", value: "name" },
        { text: "State", value: "needsAttention" },
        { text: "Updated", value: "lastUpdated" }
      ],
      lName: "datasets",
      sName: "dss",
      cols: [
        {
          name: "id",
          renderer(props) {
            return props.item.id;
          }
        },
        {
          name: "shortName",
          renderer(props) {
            return props.item.shortName;
          }
        },
        {
          name: "name",
          renderer(props) {
            return props.item.name;
          }
        },
        {
          name: "needsAttention",
          renderer(props) {
            return props.item.needsAttention;
          }
        },
        {
          name: "lastUpdated",
          renderer(props) {
            return moment.unix(props.item.lastUpdated / 1000).format("L");
          }
        }
      ]
    };
  }
};
</script>
