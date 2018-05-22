<template>
    <v-container fluid>
        <div class="browser">
            <h1>This is the datasets page</h1>
        </div>
        <v-progress-linear :indeterminate="pending"/>
        <v-form ref="form" lazy-validation>
            <v-text-field v-model="limit" required :rules="[v => !!v || 'Must be filled in!']" :loading="pending"/>
            <v-btn type="submit" v-on:click="refreshDatasets()">refresh datasets</v-btn>
        </v-form>
        <div v-if="error" class="error">{{error}}</div>
        <div v-if="datasets != null" v-for="dataset in datasets" v-bind:key="dataset.id">{{dataset.shortName}}
        </div>
    </v-container>
</template>

<script>
import { mapState } from "vuex";

export default {
  mounted() {
    this.refreshDatasets();
  },
  data() {
    return {};
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
        this.$store.dispatch(`dss/setLimit`, value);
        // ...mapActions({ setLimit: "dss/setLimit" }) :: not using mapActions because this exposes the method to the
        // template directly, which may lead to bugs when when they are used instead of the local wrapper function.
      }
    }
  },
  methods: {
    refreshDatasets() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch("getDatasets", { params: { limit: this.limit } });
      }
    }
  }
};
</script>
