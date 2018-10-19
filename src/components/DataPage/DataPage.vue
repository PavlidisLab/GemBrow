<template>
    <v-container fluid class="text-xs-left">
        <v-layout row wrap class="elevation-4">
            <v-flex xs12>
                <v-card flat>
                    <v-layout row justify-space-between>
                        <v-flex xs2>
                            <v-card tile flat>
                                <v-card-text>
                                    <v-btn round flat medium class="text-xs-center" v-on:click="toggleColsSettings()"
                                           title="Table column settings" color="light-blue">
                                        <v-icon>view_week</v-icon>
                                        &nbsp;Columns
                                    </v-btn>
                                </v-card-text>
                            </v-card>
                        </v-flex>
                        <v-flex xs9 d-flex align-center v-if="error">
                            <v-card tile flat>
                                <v-alert xs10 v-if="error && items.length === 0" :value="error" type="error" outline>
                                    {{error}}
                                </v-alert>
                                <v-alert xs10 v-else-if="error && items.length > 0" :value="error && items.length > 0"
                                         type="error" outline>
                                    <v-layout row align-center d-flex>
                                        <v-flex text-xs-right>Connection problem, showing cached data.</v-flex>
                                        <v-flex text-xs-right>
                                            <v-btn xs2 small v-on:click="refreshData()" color="error"
                                                   class="lcase" title="Try to refresh the data">
                                                <v-icon>sync</v-icon>
                                            </v-btn>
                                        </v-flex>
                                    </v-layout>
                                </v-alert>
                            </v-card>
                        </v-flex>
                        <v-flex xs3 text-xs-right>
                            <v-card tile flat>
                                <v-card-text>
                                    <v-btn round flat medium class="text-xs-center" v-on:click="toggleSettings()"
                                           title="Data filters"
                                           color="light-blue">
                                        <v-icon>mdi-filter</v-icon>
                                        &nbsp;Filters
                                    </v-btn>
                                    <csv-button
                                            :cols="cols"
                                            :visible-cols="visibleCols"
                                            :fields="headers"
                                            :get-data-func="refreshData"
                                            :prop-name="lName"
                                            :prop-download-name="downloadName"
                                            :refresh-params="refreshParams"
                                    ></csv-button>
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
                                    <v-layout row wrap class="text-xs-left col-row compact" justify-start>
                                        <v-flex v-for="col in cols" v-bind:key="col.value" xs12 sm6 md3
                                                v-if="!col.adminOnly || (col.adminOnly && user && user.isAdmin) ">
                                            <v-switch tile flat
                                                      :label="col.labelMain ? col.labelMain : col.label"
                                                      v-model="visibleCols" :value="col.label" :title="col.tip"/>
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
                                    :total-items="total"
                                    :rows-per-page-items="[10,20,50,100]"
                                    no-data-text="No entries for given filters."
                                    disable-initial-sort
                                    :class="pending ? 'data loading' : ''">
                                <v-progress-linear slot="progress" color="blue" indeterminate height="3"></v-progress-linear>
                                <template slot="headerCell" slot-scope="props">
                                    <span :title="props.header.tip">{{ props.header.labelMain ? props.header.labelMain : props.header.label }}</span>
                                </template>
                                <template slot="items" slot-scope="props">
                                    <tr v-on:click="props.expanded = !props.expanded">
                                        <td class="text-xs-left" v-for="col in headers" v-bind:key="col.value"
                                            v-show="visibleCols.includes(col.label) && (!col.adminOnly || (col.adminOnly && user && user.isAdmin)) ">
                                            <a v-if="col.link" v-bind:href="col.link(props)" target="_blank">
                                                <TableCell
                                                        :tip="col.rowTip ? col.rowTip(props) : ''"
                                                        :icon="col.icon ? col.icon(props) : ''"
                                                        :iconColor="col.iconColor ? col.iconColor(props) : ''"
                                                        :iconStyle="col.iconStyle ? col.iconStyle(props) : ''"
                                                        :iconClass="col.iconClass ? col.iconClass(props) : ''"
                                                        :text="col.renderer ? col.renderer(props) : ''"
                                                />
                                            </a>
                                            <TableCell v-else
                                                       :tip="col.rowTip ? col.rowTip(props) : ''"
                                                       :icon="col.icon ? col.icon(props) : ''"
                                                       :iconColor="col.iconColor ? col.iconColor(props) : ''"
                                                       :iconStyle="col.iconStyle ? col.iconStyle(props) : ''"
                                                       :iconClass="col.iconClass ? col.iconClass(props) : ''"
                                                       :text="col.renderer ? col.renderer(props) : ''"
                                            />
                                        </td>
                                    </tr>
                                </template>
                                <template slot="expand" slot-scope="props">
                                    <v-card :color="$store.state.main.themeDark ? 'blue-grey darken-4' : 'blue-grey lighten-5'">
                                        <v-card-text>
                                            <v-layout row>
                                                <v-flex xs3>
                                                    <v-subheader class="headline">
                                                        {{ props.item.shortName }}
                                                    </v-subheader>
                                                </v-flex>
                                                <v-flex xs10>
                                                    <v-subheader class="headline">
                                                        {{ props.item.name }}
                                                    </v-subheader>
                                                </v-flex>
                                            </v-layout>
                                            <v-divider/>
                                            <v-layout row>
                                                <v-flex sm3>
                                                    <v-layout row>
                                                        <v-flex xs4>
                                                            <v-subheader>Taxon:</v-subheader>
                                                        </v-flex>
                                                        <v-flex xs6>
                                                            <v-subheader>{{ props.item.taxon }}</v-subheader>
                                                        </v-flex>
                                                    </v-layout>
                                                    <v-layout row>
                                                        <v-flex xs4>
                                                            <v-subheader>Updated:</v-subheader>
                                                        </v-flex>
                                                        <v-flex xs6>
                                                            <v-subheader>{{ formatDate(props.item.lastUpdated) }}</v-subheader>
                                                        </v-flex>
                                                    </v-layout>
                                                    <v-layout row v-for="row in detailRows" :key="row.label">
                                                        <v-flex xs4>
                                                            <v-subheader>{{ row.label }}</v-subheader>
                                                        </v-flex>
                                                        <v-flex xs6>
                                                            <v-subheader v-html="row.renderer(props)"></v-subheader>
                                                        </v-flex>
                                                    </v-layout>
                                                </v-flex>
                                                <v-flex sm9>
                                                    <v-layout row>
                                                        <v-flex xs1>
                                                            <v-subheader>Description:</v-subheader>
                                                        </v-flex>
                                                    </v-layout>
                                                    <v-flex xs12>
                                                        <v-card tile>
                                                            <v-card-text>
                                                                <span class="description body-1">
                                                                    {{ props.item.description.trim() }}
                                                                </span>
                                                            </v-card-text>
                                                        </v-card>
                                                    </v-flex>
                                                </v-flex>
                                            </v-layout>
                                        </v-card-text>
                                    </v-card>
                                </template>
                            </v-data-table>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex d-flex xs12 :class="settingsVisible ? 'md3' : 'md0'" v-show="settingsVisible" order-xs1
                        order-md2>
                    <v-card tile flat color="grey darken-1" v-show="settingsVisible" dark>
                        <v-card-title primary class="filters title">
                            Filters
                            <v-spacer/>
                            <v-btn icon flat small class="text-xs-center" color="grey lighten-3">
                                <v-icon>mdi-help-circle</v-icon>
                                <span hidden>Help</span>
                            </v-btn>
                        </v-card-title>
                        <v-card-text class="text-xs-justify full-dividers compact">
                            <v-form ref="settings" lazy-validation>
                                <slot name="settingsForm"/>
                                <div>
                                    <v-btn class="light-blue darken-1" block round type="submit" v-on:click="refreshData()" :loading="pending" :disabled="pending">
                                        <span slot="loader" class="custom-loader">
                                            <v-icon>mdi-loading spin</v-icon>
                                        </span>
                                        <v-icon left dark>mdi-filter</v-icon>
                                        Apply filters
                                    </v-btn>
                                </div>
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
import moment from "moment";
import TableCell from "../TableCell";
import CsvButton from "./CsvButton";

export default {
  components: { TableCell, CsvButton },
  props: {
    title: String,
    cols: Array,
    detailRows: Array,
    lName: String,
    sName: String,
    cName: String,
    sortMapping: Function,
    preRefreshProp: String,
    preRefreshFuncParam: String,
    downloadName: String
  },
  data() {
    return {
      pagination: {},
      visibleCols: []
    };
  },
  mounted() {
    this.$root.$on("logout", () => {
      this.refreshData();
    });
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
  computed: {
    ...mapState({
      user: state => state.main.user,
      settingsVisible: state => state.main.searchSettVisible,
      colSettingsVisible: state => state.main.tableSettVisible,
      items(state) {
        return state.api[this.lName];
      },
      pending(state) {
        if (this.preRefreshProp) {
          return (
            state.api.pending[this.lName] ||
            state.api.pending[this.preRefreshProp]
          );
        }
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
          if (
            this.visibleCols.includes(col.label) &&
            (!col.adminOnly ||
              (col.adminOnly && this.user && this.user.isAdmin))
          )
            arr.push(col);
        }
        return arr;
      }
    },
    total: {
      get() {
        return this.items.length > 0 ? this.items[0]._totalInQuery : 0;
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
        // template directly, which may lead to bugs when they are used instead of the designated wrapper property getter.
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
        const params = Vue.util.extend({}, this.$store.state[this.sName]);
        params.filter = this.$store.getters[this.sName + "/filter"];
        params.taxon_id = this.$store.getters[this.sName + "/taxon_id"];
        return params;
      }
    }
  },
  watch: {
    pagination() {
      this.paginate();
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
  methods: {
    paginate() {
      const { sortBy, descending, page, rowsPerPage } = this.pagination;
      let changed = false;
      // noinspection JSUnusedGlobalSymbols // Setter updates the store
      let newOffset = (page - 1) * rowsPerPage;
      if (this.offset !== newOffset) {
        this.offset = newOffset;
        changed = true;
      }

      let newLimit = rowsPerPage;
      if (this.limit !== newLimit) {
        this.limit = newLimit;
        changed = true;
      }

      const order = descending ? "-" : "%2B"; // false value is url encoded '+' character.

      // Transform sort parameters to non-VO counterparts. Note that more checks might be necessary here, especially
      // manual overrides for geeq scores are used.
      let newSortBy = this.sortMapping(sortBy);

      let newSort = newSortBy ? order + newSortBy : null;
      if (this.sort !== newSort) {
        // noinspection JSUnusedGlobalSymbols // Necessary to set the property for the refreshData method
        this.sort = newSort;
        changed = true;
      }
      if (changed) {
        this.refreshData();
      }
    },
    refreshData: Vue._.debounce(function() {
      if (this.preRefreshProp) {
        return this.$store
          .dispatch("api/get" + this.preRefreshProp, {
            params: this.preRefreshFuncParam
          })
          .then(() => {
            // noinspection JSIgnoredPromiseFromCall
            this.$store.dispatch("api/get" + this.lName, {
              params: this.refreshParams
            });
          });
      } else {
        if (this.$refs.settings.validate()) {
          // noinspection JSIgnoredPromiseFromCall
          return this.$store.dispatch("api/get" + this.lName, {
            params: this.refreshParams
          });
        }
      }
    }, 500),
    toggleSettings() {
      // noinspection JSIgnoredPromiseFromCall
      this.$store.dispatch("main/toggleSearchSettings");
    },
    toggleColsSettings() {
      // noinspection JSIgnoredPromiseFromCall
      this.$store.dispatch("main/toggleTableSettings");
    },
    formatDate(date) {
      return moment.unix(date / 1000).format("L");
    }
  }
};
</script>

<style lang="scss">
@import "../../assets/const";

.table__overflow {
  overflow-x: hidden;
}

.table-ctrls > * {
  min-width: $dim4 * 4;
}

td i {
  width: $dim5;
}

.data.loading {
  filter: opacity(70%) grayscale(100%);
}

.col-row {
  padding-left: $dim2;
  padding-bottom: $dim3;
}

.col-row .input-group {
  padding-top: $dim1;
  padding-bottom: $dim1;
}

.score {
  color: $dark1 !important;
  border-radius: $dim3;
  max-width: $dim3 + 4;
  max-height: $dim3 + 4;
}

.description {
  white-space: pre-wrap;
}

.filters.title {
  padding-bottom: 0;
}

.full-dividers {
  padding-left: 0;
  padding-right: 0;
}

.full-dividers > form > div {
  padding: $dim2 $dim3 - 4 $dim2 $dim3 + 4;
}

.compact .input-group__details {
  display: none;
}
</style>
