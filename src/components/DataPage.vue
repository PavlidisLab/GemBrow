<template>
    <v-container fluid class="text-xs-left">
        <h1>{{title}}</h1>
        <v-layout row wrap class="elevation-4">
            <v-flex xs12>
                <v-card flat>
                    <v-layout row justify-space-between>
                        <v-flex xs2>
                            <v-card tile flat>
                                <v-card-text>
                                    <v-btn icon flat large class="text-xs-center" v-on:click="toggleColsSettings()"
                                           title="Table settings" color="light-blue">
                                        <v-icon>view_week</v-icon>
                                    </v-btn>
                                </v-card-text>
                            </v-card>
                        </v-flex>
                        <v-flex xs10 d-flex align-center v-if="error" >
                            <v-card tile flat>
                                <v-alert xs10 v-if="error && items.length === 0" :value="error" type="error" outline>
                                    {{error}}
                                </v-alert>
                                <v-alert xs10 v-else-if="error && items.length > 0" :value="error && items.length > 0" type="error" outline>
                                    <v-layout row align-center d-flex>
                                    <v-flex text-xs-right>Connection problem, showing cached data.</v-flex>
                                    <v-flex text-xs-right>
                                        <v-tooltip bottom>
                                            <template slot="activator">
                                                <v-btn xs2 small v-on:click="refreshData()" color="error" class="lcase"><v-icon>sync</v-icon></v-btn>
                                            </template>
                                            Try to refresh the data
                                        </v-tooltip>
                                    </v-flex>
                                    </v-layout>
                                </v-alert>
                            </v-card>
                        </v-flex>
                        <v-flex xs2 text-xs-right>
                            <v-card tile flat>
                                <v-card-text>
                                    <v-btn icon flat large class="text-xs-center" v-on:click="toggleSettings()"
                                           title="Data filters"
                                           color="light-blue">
                                        <v-icon>settings</v-icon>
                                    </v-btn>
                                </v-card-text>
                            </v-card>
                        </v-flex>
                    </v-layout>
                </v-card>
            </v-flex>
            <v-layout row wrap>
                <v-flex xs12 wrap :class="settingsVisible ? 'md9' : 'md12'" order-xs2 order-md1>
                    <v-layout row wrap>
                        <v-flex xs12>
                            <v-card tile flat v-show="colSettingsVisible" color="blue-grey darken-1" dark>
                                <v-card-title primary class="title">Columns</v-card-title>
                                <v-card-text>
                                    <v-layout row wrap class="text-xs-left" justify-start>
                                        <v-flex v-for="col in cols" v-bind:key="col.value" xs12 sm6 md3>
                                            <v-switch tile flat
                                                      :label="col.text" v-model="visibleCols" :value="col.text"/>
                                        </v-flex>
                                    </v-layout>
                                </v-card-text>
                            </v-card>
                        </v-flex>
                        <v-flex xs12>
                            <v-data-table
                                    :headers="headers"
                                    :items="items"
                                    :loading="pending"
                                    :pagination.sync="pagination"
                                    :total-items="2000"
                                    :rows-per-page-items="[10,20,50,100]"
                                    disable-initial-sort>
                                <template slot="headerCell" slot-scope="props">
                                    <v-tooltip bottom>
                                        <span slot="activator">{{ props.header.text }}</span>
                                        <span>{{ props.header.tip }}</span>
                                    </v-tooltip>
                                </template>
                                <template slot="items" slot-scope="props">
                                    <td class="text-xs-left" v-for="col in headers" v-bind:key="col.value"
                                        v-show="visibleCols.includes(col.text)">
                                        <a v-if="col.link" v-bind:href="col.link(props)" target="_blank">
                                            <TableCell
                                                    :tip="col.rowTip ? col.rowTip(props) : ''"
                                                    :icon="col.icon ? col.icon(props) : ''"
                                                    :iconColor="col.iconColor ? col.iconColor(props) : ''"
                                                    :iconStyle="col.iconStyle ? col.iconStyle(props) : ''"
                                                    :iconClass="col.iconClass ? col.iconClass(props) : ''"
                                                    :text="col.renderer ? col.renderer(props) : ''"
                                                    :link="col.link ? col.link(props) : ''"
                                            />
                                        </a>
                                        <TableCell v-else
                                                :tip="col.rowTip ? col.rowTip(props) : ''"
                                                :icon="col.icon ? col.icon(props) : ''"
                                                :iconColor="col.iconColor ? col.iconColor(props) : ''"
                                                :iconStyle="col.iconStyle ? col.iconStyle(props) : ''"
                                                :iconClass="col.iconClass ? col.iconClass(props) : ''"
                                                :text="col.renderer ? col.renderer(props) : ''"
                                                :link="col.link ? col.link(props) : ''"
                                        />
                                    </td>
                                </template>
                            </v-data-table>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex d-flex xs12 :class="settingsVisible ? 'md3' : 'md0'" v-show="settingsVisible" order-xs1
                        order-md2>
                    <v-card tile flat color="grey darken-1" v-show="settingsVisible" dark>
                        <v-card-title primary class="title">Filters</v-card-title>
                        <v-card-text class="text-xs-justify">
                            <v-form ref="settings" lazy-validation>
                                <slot name="settingsForm"/>
                                <v-btn class="secondary" type="submit" v-on:click="refreshData()" :loading="pending">
                                    <span slot="loader" class="custom-loader">
                                        <v-icon class="spin inv">sync</v-icon>
                                    </span>
                                    Apply filters
                                </v-btn>
                            </v-form>
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-layout>
    </v-container>
</template>


<script>
import { mapState } from "vuex";
import Vue from "vue";
import TableCell from "./TableCell";

export default {
  components: { TableCell },
  props: {
    title: String,
    cols: Array,
    lName: String,
    sName: String,
    cName: String
  },
  data() {
    return {
      pagination: {},
      visibleCols: []
    };
  },
  created() {
    // Initial data load
    this.refreshData();

    // Show columns that are set to visible in the store
    for (let col in this.$store.state[this.cName]) {
      // noinspection JSUnfilteredForInLoop
      if (this.$store.state[this.cName][col]) {
        // noinspection JSUnfilteredForInLoop
        this.visibleCols.push(col);
      }
    }
  },
  watch: {
    pagination() {
      this.updatePage();
    },
    visibleCols() {
      for (let col in this.$store.state[this.cName]) {
        // noinspection JSUnfilteredForInLoop
        const storeVal = this.$store.state[this.cName][col];
        // noinspection JSUnfilteredForInLoop
        if (this.visibleCols.includes(col) && !storeVal) {
          // noinspection JSIgnoredPromiseFromCall
          this.$store.dispatch(this.cName + "/set" + col, true);
        } else {
          // noinspection JSUnfilteredForInLoop
          if (!this.visibleCols.includes(col) && storeVal) {
            // noinspection JSIgnoredPromiseFromCall
            this.$store.dispatch(this.cName + "/set" + col, false);
          }
        }
      }
    }
  },
  computed: {
    ...mapState({
      settingsVisible: state => state.main.searchSettVisible,
      colSettingsVisible: state => state.main.tableSettVisible,
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
    headers: {
      get() {
        const arr = [];
        for (let col of this.cols) {
          if (this.visibleCols.includes(col.text)) arr.push(col);
        }
        return arr;
      }
    },
    limit: {
      get() {
        return this.$store.state[this.sName].limit;
      },
      set(value) {
        // noinspection JSIgnoredPromiseFromCall
        this.$store.dispatch(this.sName + "/setLimit", value);
        // ...mapActions({ setLimit: "dss/setLimit" }) :: not using mapActions because this exposes the method to the
        // template directly, which may lead to bugs when when they are used instead of the designated wrapper function.
      }
    },
    offset: {
      get() {
        return this.$store.state[this.sName].offset;
      },
      set(value) {
        // noinspection JSIgnoredPromiseFromCall
        this.$store.dispatch(this.sName + "/setOffset", value);
      }
    },
    sort: {
      get() {
        return this.$store.state[this.sName].sort;
      },
      set(value) {
        // noinspection JSIgnoredPromiseFromCall
        this.$store.dispatch(this.sName + "/setSort", value);
      }
    },
    refreshParams: {
      get() {
        const params = this.$store.state[this.sName];
        params.filter = this.$store.getters[this.sName + "/filter"];
        params.taxon_id = this.$store.getters[this.sName + "/taxon_id"];
        return params;
      }
    }
  },
  methods: {
    updatePage() {
      const { sortBy, descending, page, rowsPerPage } = this.pagination;
      // noinspection JSUnusedGlobalSymbols // Setter updates the store
      this.offset = (page - 1) * rowsPerPage;
      this.limit = rowsPerPage;
      const order = descending ? "-" : "%2B"; // false value is url encoded '+' character.

      // Transform sort parameters to non-VO counterparts. Note that more checks might be necessary here, especially
      // manual overrides for geeq scores are used.
      let sort = sortBy;
      if (sort === "geeq.publicQualityScore")
        sort = "geeq.detectedQualityScore";
      else if (sort === "geeq.publicSuitabilityScore")
        sort = "geeq.detectedSuitabilityScore";
      else if (
        sort === "troubled" ||
        sort === "needsAttention" ||
        sort === "lastUpdated"
      )
        sort = "curationDetails." + sort;
      else if (sort === "arrayDesignCount") {
        sort = "ad.size";
      }

      this.sort = sort ? order + sort : null;
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
    },
    toggleColsSettings() {
      // noinspection JSIgnoredPromiseFromCall
      this.$store.dispatch("main/toggleTableSettings");
    }
  }
};
</script>

<style lang="scss">
@import "../assets/const.scss";

.table__overflow {
  overflow-x: hidden;
}

.table-ctrls > * {
  min-width: $dim4 * 4;
}

td i {
  width: $dim5;
}

.score {
  color: $dark1 !important;
  border-radius: $dim3;
  max-width: $dim3 + 4;
  max-height: $dim3 + 4;
}
</style>
