<template>
    <a :download="downloadName" :href="downloadUrl" :disabled="this.data.length === 0">
        <v-btn round flat medium class="text-xs-center"
               title="Download all data matching the current filters as a csv file. Respects the 'columns' settings."
               color="light-blue">
            <v-icon>mdi-file-download</v-icon>
            &nbsp;CSV
        </v-btn>
    </a>
</template>

<script>
import json2csv from "json2csv";

export default {
  props: {
    fields: undefined,
    data: undefined,
    downloadName: {
      default: "export.csv"
    }
  },
  computed: {
    downloadUrl() {
      const parser = new json2csv.Parser({ fields: this.fields, quote: "" });
      return this.data.length > 0
        ? "data:text/csv," + encodeURIComponent(parser.parse(this.data))
        : "javascript:void(0);";
    }
  }
};
</script>
