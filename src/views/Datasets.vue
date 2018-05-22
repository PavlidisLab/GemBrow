<template>
    <v-container fluid>
        <h1 class="text-xs-left">Dataset Browser</h1>
        <v-form ref="form" lazy-validation>
            <v-text-field v-model="limit" required :rules="[v => !!v || 'Must be filled in!']"/>
            <v-btn type="submit" v-on:click="refreshDatasets()">refresh datasets</v-btn>
        </v-form>
        <div v-if="error" class="error">{{error}}</div>
        <v-data-table :headers="headers" :items="datasets" :loading="pending">
            <template slot="items" slot-scope="props">
                <td class="text-xs-left">{{ props.item.shortName }}</td>
                <td class="text-xs-left">{{ props.item.name }}</td>
                <td class="text-xs-left">{{ props.item.needsAttention }}</td>
            </template>
        </v-data-table>
    </v-container>
</template>

<script>
import { mapState } from "vuex";

export default {
  mounted() {
    this.refreshDatasets();
  },
  data() {
    return {
      headers: [
        { text: "Accession", value: "shortName" },
        { text: "Name", value: "name" },
        { text: "State", value: "needsAttention" }
      ]
    };
  },
  computed: {
    ...mapState({
      datasets: state => state.api.datasets,
      pending: state => state.api.pending.datasets,
      error: state => state.api.error.datasets
    }),
    limit: {
      get: function() {
        return this.$store.state.dss.limit;
      },
      set: function(value) {
        // noinspection JSIgnoredPromiseFromCall
        this.$store.dispatch(`dss/setLimit`, value);
        // ...mapActions({ setLimit: "dss/setLimit" }) :: not using mapActions because this exposes the method to the
        // template directly, which may lead to bugs when when they are used instead of the designated wrapper function.
      }
    }
  },
  methods: {
    refreshDatasets() {
      if (this.$refs.form.validate()) {
        // noinspection JSIgnoredPromiseFromCall
        this.$store.dispatch("getDatasets", { params: { limit: this.limit } });
      }
    }
  }
};
</script>
