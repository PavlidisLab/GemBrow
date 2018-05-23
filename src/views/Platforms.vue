<template>
    <v-container fluid class="text-xs-left">
        <h1>Dataset Browser</h1>

        <div v-if="error" class="error">{{error}}</div>
        <v-btn icon flat large class="text-xs-center" v-on:click="toggleSettings()" title="Settings" color="light-blue">
            <v-icon>settings</v-icon>
        </v-btn>
        <v-layout row wrap>
            <v-flex d-flex xs12 :class="settingsVisible ? 'md3' : 'md0'" v-show="settingsVisible">
                <v-card tile flat color="light-blue" v-show="settingsVisible">
                    <v-card-title primary class="title">Search</v-card-title>
                    <v-card-text class="text-xs-justify">
                        <v-form ref="form" lazy-validation>
                            <v-text-field v-model="limit" required :rules="[v => !!v || 'Must be filled in!']" label="Limit amount" single-line prepend-icon="unfold_less"/>
                            <v-btn type="submit" v-on:click="refreshPlatforms()">refresh platforms</v-btn>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-flex xs12 :class="settingsVisible ? 'md9' : 'md12'" >
                <v-data-table
                        :headers="headers"
                        :items="platforms"
                        :loading="pending"
                        :rows-per-page-items="[10,20,50,100]"
                        class="elevation-4">
                    <template slot="items" slot-scope="props">
                        <td class="text-xs-left">{{ props.item.shortName }}</td>
                        <td class="text-xs-left">{{ props.item.name }}</td>
                        <td class="text-xs-left">{{ props.item.taxon }}</td>
                        <td class="text-xs-left">{{ new Date(props.item.lastUpdated) |
                            moment($moment.localeData().longDateFormat('L')) }}
                        </td>
                    </template>
                </v-data-table>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import { mapState } from "vuex";

export default {
  mounted() {
    this.refreshPlatforms();
  },
  data() {
    return {
      headers: [
        { text: "Accession", value: "shortName" },
        { text: "Name", value: "name" },
        { text: "Taxon", value: "taxon" },
        { text: "Updated", value: "lastUpdated" }
      ]
    };
  },
  computed: {
    ...mapState({
      platforms: state => state.api.platforms,
      pending: state => state.api.pending.platforms,
      error: state => state.api.error.platforms,
      settingsVisible: state => state.main.searchSettVisible
    }),
    limit: {
      get: function() {
        return this.$store.state.dss.limit;
      },
      set: function(value) {
        // noinspection JSIgnoredPromiseFromCall
        this.$store.dispatch(`pfs/setLimit`, value);
        // ...mapActions({ setLimit: "dss/setLimit" }) :: not using mapActions because this exposes the method to the
        // template directly, which may lead to bugs when when they are used instead of the designated wrapper function.
      }
    }
  },
  methods: {
    refreshPlatforms() {
      if (this.$refs.form.validate()) {
        // noinspection JSIgnoredPromiseFromCall
        this.$store.dispatch("api/getPlatforms", {
          params: { limit: this.limit }
        });
      }
    },
    toggleSettings() {
      // noinspection JSIgnoredPromiseFromCall
      this.$store.commit("main/toggleSearchSettings");
    }
  },
  filters: {
    toSeconds(value) {
      return (value - value % 1000) / 1000;
    }
  }
};
</script>
