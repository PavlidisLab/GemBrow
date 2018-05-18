<template>
    <v-container fluid>
        <div class="browser">
            <h1>This is the datasets page</h1>
        </div>
        <v-progress-linear :indeterminate="pending"/>
        <v-form ref="form">
            <v-text-field v-model="id" required :rules="[v => !!v || 'Must be filled in!']" :loading="pending"/>
            <v-btn v-on:click="submitDatasetUdpate()">load dataset</v-btn>
            <v-btn v-on:click="getDatasets()">refresh datasets</v-btn>
        </v-form>
        <div v-if="err" class="error">{{err}}</div>
        <div v-if="dataset !== null" class="info">{{dataset.data[0].shortName}}</div>
        <div v-if="error" class="error">{{error}}</div>
        <div v-if="datasets != null" v-for="dataset in datasets" v-bind:key="dataset.id">{{dataset.shortName}}
        </div>
    </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  created() {
    //this.getDatasets();
  },
  data() {
    return {
      id: null,
      err: null
    };
  },
  computed: mapState({
    dataset: state => state.api.dataset,
    datasets: state => state.api.datasets,
    pending: state => state.api.pending.datasets,
    error: state => state.api.error.datasets
  }),
  methods: {
    ...mapActions(["getDatasets", "getDataset"]),
    submitDatasetUdpate() {
      if (this.$refs.form.validate()) {
        this.getDataset({ params: { id: this.id } });
        this.err = null;
      } else {
        this.err = "Provide ID!";
      }
    }
  }
};
</script>
