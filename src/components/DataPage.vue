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
                    <v-card-title primary class="title">Search</v-card-title>
                    <v-card-text class="text-xs-justify">
                        <v-form ref="settings" lazy-validation>
                            <slot name="settingsForm"/>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-flex xs12 :class="settingsVisible ? 'md9' : 'md12'" >
                <slot name="table"/>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {
    headers: String,
    data: Array,
    pending: Boolean,
    error: String,
    limit: Number,
    refreshDispatchName: String,
    refreshParams: Object
  },
  mounted() {
    this.refreshDatasets();
  },
  computed: {
    ...mapState({
      settingsVisible: state => state.main.searchSettVisible
    })
  },
  methods: {
    refreshDatasets() {
      if (this.$refs.settings.validate()) {
        // noinspection JSIgnoredPromiseFromCall
        this.$store.dispatch(this.refreshDispName, {
          params: this.refreshParams
        });
      }
    },
    toggleSettings() {
      // noinspection JSIgnoredPromiseFromCall
      this.$store.commit("main/toggleSearchSettings");
    }
  }
};
</script>
