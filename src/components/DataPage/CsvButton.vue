<template>
    <v-btn
            rounded
            text
            medium
            class="text-xs-center"
            title="Download all data matching the current filters as a csv file. Respects the 'columns' settings."
            color="light-blue"
            :disabled="
      pending ||
      this.itemsPage.length < 1 ||
      this.$store.state.api.pending[this.propName]
    "
            v-on:click="downloadData()"
    >
        <v-icon v-if="!pending">mdi-file-download</v-icon>
        <v-icon v-if="pending">mdi-loading spin</v-icon>
        &nbsp;CSV
    </v-btn>
</template>

<script>
import json2csv from "json2csv";
import moment from "moment";
import { mapState } from "vuex";

export default {
  props: {
    fields: Array,
    cols: Array,
    visibleCols: Array,
    getDataFunc: Function,
    propName: String,
    propDownloadName: String,
    refreshParams: Object
  },
  data: function() {
    return {
      unsubscribe_dss: Function,
      unsubscribe_csv: Function,
      pendingLocal: false
    };
  },
  computed: {
    ...mapState({
      itemsPage(state) {
        return state.api[this.propName];
      },
      items(state) {
        return state.api[this.propNameCsv];
      },
      pending(state) {
        return (
          this.pendingLocal &&
          (state.api.pending[this.propName] ||
            state.api.pending[this.propNameCsv])
        );
      },
      error(state) {
        return state.api.error[this.propNameCsv];
      }
    }),
    downloadName() {
      return (
        moment.unix(moment().valueOf() / 1000).format("L") +
        "_gembrow" +
        (this.propDownloadName ? this.propDownloadName : "_") +
        this.propName +
        ".csv"
      );
    },
    propNameCsv() {
      return this.propName + "Csv";
    },
    mutationName() {
      return "api/GET" + this.propName.toUpperCase();
    },
    items_rendered: {
      get() {
        {
          const data = JSON.parse(JSON.stringify(this.items));
          for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < this.cols.length; j++) {
              const col = this.cols[j];
              if (col.renderer) {
                data[i][col.value] = col.renderer({ item: data[i] });
              } else if (col.link) {
                data[i][col.value] = col.link({ item: data[i] });
              }
            }
          }
          return data;
        }
      }
    }
  },
  methods: {
    downloadData() {
      if (!this.pending) {
        this.pendingLocal = true;
        this.getDataFunc();

        this.unsubscribe_dss = this.$store.subscribe((mutation) => {
          if (mutation.type === this.mutationName + "_SUCCEEDED") {
            this.$store
              .dispatch("api/get" + this.propNameCsv, {
                params: this.refreshParams
              })
              .then(() => {
                this.unsubscribe_dss();
              });
          }
        });

        this.unsubscribe_csv = this.$store.subscribe((mutation) => {
          if (mutation.type === this.mutationName + "_CSV_SUCCEEDED") {
            let link = document.createElement("a");
            link.href = this.getUrl();
            link.setAttribute("download", this.downloadName);
            document.body.appendChild(link);
            link.click();

            this.unsubscribe_csv();
            this.pendingLocal = false;

            // Cleanup is necessary for when the downloaded data is very big
            document.body.removeChild(link);
            link.href = null;
            link = null;
          }
        });
      }
    },
    getUrl() {
      const parser = new json2csv.Parser({ fields: this.fields, quote: "" });
      return this.itemsPage.length > 0
        ? "data:text/csv," +
        encodeURIComponent(parser.parse(this.items_rendered))
        : "javascript:void(0);";
    }
  }
};
</script>
