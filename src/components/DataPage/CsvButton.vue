<template>
        <v-btn round flat medium class="text-xs-center"
               title="Download all data matching the current filters as a csv file. Respects the 'columns' settings."
               color="light-blue"
                v-on:click="downloadData()">
            <v-icon v-if="!pending">mdi-file-download</v-icon>
            <v-icon v-if="pending" class="spin inv">mdi-loading</v-icon>
            &nbsp;CSV
        </v-btn>
</template>

<script>
import json2csv from "json2csv";
import { mapState } from "vuex";

export default {
  props: {
    fields: Array,
    cols: Array,
    visibleCols: Array,
    getDataFunc: Function,
    downloadName: {
      default: "export.csv"
    },
    propName: String
  },
  created() {
    this.$store.state.api.pending[this.propNameCsv] = false;
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
        return state.api.pending[this.propNameCsv];
      },
      error(state) {
        return state.api.error[this.propNameCsv];
      }
    }),
    propNameCsv() {
      return this.propName + "Csv";
    },
    downloadUrl() {
      const parser = new json2csv.Parser({ fields: this.fields, quote: "" });
      return this.itemsPage.length > 0
        ? "data:text/csv," +
            encodeURIComponent(parser.parse(this.items_rendered))
        : "javascript:void(0);";
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
        this.getDataFunc(() => {
          const url = this.downloadUrl;
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", this.downloadName); //or any other extension
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      }
    }
  }
};
</script>
