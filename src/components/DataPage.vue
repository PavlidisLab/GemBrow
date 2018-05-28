<template>
    <v-container fluid class="text-xs-left">
        <h1>{{title}}</h1>

        <div v-if="error" class="error">{{error}}</div>
        <v-btn icon flat large class="text-xs-center" v-on:click="toggleSettings()" title="Settings" color="light-blue">
            <v-icon>settings</v-icon>
        </v-btn>
        <v-layout row wrap>
            <v-flex d-flex xs12 :class="settingsVisible ? 'md3' : 'md0'" v-show="settingsVisible">
                <v-card tile flat color="light-blue" v-show="settingsVisible">
                    <v-card-title primary class="title">Filters</v-card-title>
                    <v-card-text class="text-xs-justify">
                        <v-form ref="settings" lazy-validation>
                            <slot name="settingsForm"/>
                            <v-btn type="submit" v-on:click="refreshData()">refresh data</v-btn>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-flex d-flex xs12 :class="settingsVisible ? 'md9' : 'md12'" >
                <v-data-table
                        :headers="headers"
                        :items="items"
                        :loading="pending"
                        :pagination.sync="pagination"
                        :total-items="2000"
                        :rows-per-page-items="[10,20,50,100]"
                        class="elevation-4">
                <slot name="table"/>
                </v-data-table>
            </v-flex>
        </v-layout>
    </v-container>
</template>


<script>
import { mapState } from "vuex";
import Vue from "vue";

export default {
  props: {
    title: String,
    headers: Array,
    lName: String,
    sName: String
  },
  data() {
    return {
      pagination: {}
    };
  },
  mounted() {
    this.refreshData();
  },
  watch: {
    pagination() {
      this.updatePage();
    }
  },
  computed: {
    ...mapState({
      settingsVisible: state => state.main.searchSettVisible,
      items(state) {
        return state.api[this.lName];
      },
      pending(state) {
        return state.api.pending[this.lName];
      },
      error(state) {
        return state.api.error[this.lName];
      }
    }),
    limit: {
      get: function() {
        return this.$store.state[this.sName].limit;
      },
      set: function(value) {
        // noinspection JSIgnoredPromiseFromCall
        this.$store.dispatch(this.sName + "/setLimit", value);
        // ...mapActions({ setLimit: "dss/setLimit" }) :: not using mapActions because this exposes the method to the
        // template directly, which may lead to bugs when when they are used instead of the designated wrapper function.
      }
    },
    offset: {
      get: function() {
        return this.$store.state[this.sName].offset;
      },
      set: function(value) {
        // noinspection JSIgnoredPromiseFromCall
        this.$store.dispatch(this.sName + "/setOffset", value);
      }
    },
    sort: {
      get: function() {
        return this.$store.state[this.sName].sort;
      },
      set: function(value) {
        // noinspection JSIgnoredPromiseFromCall
        this.$store.dispatch(this.sName + "/setSort", value);
      }
    },
    refreshParams: {
      get: function() {
        return this.$store.state[this.sName];
      },
      set: function() {}
    }
  },
  methods: {
    updatePage() {
      const { sortBy, descending, page, rowsPerPage } = this.pagination;
      // noinspection JSUnusedGlobalSymbols // Setter updates the store
      this.offset = (page - 1) * rowsPerPage;
      this.limit = rowsPerPage;
      const order = descending ? "-" : "%2B"; // false value is url encoded '+' character.
      this.sort = sortBy ? order + sortBy : null;
      this.refreshData();
    },
    refreshData: Vue._.debounce(function() {
      if (this.$refs.settings.validate()) {
        this.forceRefresh();
      }
    }, 500),
    forceRefresh() {
      // noinspection JSIgnoredPromiseFromCall
      this.$store.dispatch("api/get" + this.lName, {
        params: this.refreshParams
      });
    },
    toggleSettings() {
      // noinspection JSIgnoredPromiseFromCall
      this.$store.dispatch("main/toggleSearchSettings");
    }
  }
};
</script>
