<template>
    <v-container fluid>
        <div class="browser">
            <h1>This is the platforms page</h1>
        </div>
        <v-progress-linear :indeterminate="pending"/>
        <v-form ref="form" lazy-validation>
            <v-text-field v-model="limit" required :rules="[v => !!v || 'Must be filled in!']" :loading="pending"/>
            <v-btn type="submit" v-on:click="refreshPlatforms()">refresh platforms</v-btn>
        </v-form>
        <div v-if="error" class="error">{{error}}</div>
        <div v-if="platforms != null" v-for="dataset in platforms" v-bind:key="dataset.id">{{dataset.shortName}}
        </div>
    </v-container>
</template>

<script>
import { mapState } from "vuex";

export default {
  mounted() {
    this.refreshPlatforms();
  },
  data() {
    return {};
  },
  computed: {
    ...mapState({
      platforms: state => state.api.platforms,
      pending: state => state.api.pending.platforms,
      error: state => state.api.error.platforms
    }),
    limit: {
      get: function() {
        return this.$store.state.dss.limit;
      },
      set: function(value) {
        this.$store.dispatch(`pfs/setLimit`, value);
        // ...mapActions({ setLimit: "dss/setLimit" }) :: not using mapActions because this exposes the method to the
        // template directly, which may lead to bugs when when they are used instead of the local wrapper function.
      }
    }
  },
  methods: {
    refreshPlatforms() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch("getPlatforms", { params: { limit: this.limit } });
      }
    }
  }
};
</script>
