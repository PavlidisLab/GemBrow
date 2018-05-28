<template>
    <DataPage
            v-bind:title="title"
            v-bind:headers="headers"
            v-bind:s-name="sName"
            v-bind:l-name="lName"
    >
        <template slot="settingsForm">
            <v-text-field v-model="this.$store.state.dss.limit" required :rules="[v => !!v || 'Must be filled in!']" label="Limit amount"
                          single-line prepend-icon="unfold_less"/>
        </template>
        <template slot="table">
            <template slot="items" slot-scope="props">
                <td class="text-xs-left">{{ props.item.id }}</td>
                <td class="text-xs-left">{{ props.item.shortName }}</td>
                <td class="text-xs-left">{{ props.item.name }}</td>
                <td class="text-xs-left">{{ props.item.needsAttention }}</td>
                <td class="text-xs-left">{{ new Date(props.item.lastUpdated) |
                    moment($moment.localeData().longDateFormat('L')) }}
                </td>
            </template>
        </template>
    </DataPage>
</template>

<script>
import DataPage from "../components/DataPage";

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
      sName: "dss"
    };
  },
  filters: {
    toSeconds(value) {
      return (-(value % 1000) + value) / 1000;
    }
  }
};
</script>
