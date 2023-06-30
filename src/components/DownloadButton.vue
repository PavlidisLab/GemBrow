<template>
    <div>
        <v-btn v-if="!downloading" @click="download()" icon
               :title="'Download metadata for ' + formatNumber(totalNumberOfExpressionExperiments) + ' datasets'">
            <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn v-if="downloading" @click="cancelDownload()" icon>
            <v-icon>mdi-cancel</v-icon>
        </v-btn>
    </div>
</template>

<script>
import { axiosInst, baseUrl } from "@/config/gemma";
import { parse } from "json2csv";
import { downloadAs, formatNumber } from "@/utils";
import {browsingOptions} from "@/views/Browser.vue";

export default {
  name: "DownloadButton",
  props: {
    /**
     * Browsing options to use for downloading datasets.
     */
    browsingOptions: Object,
    totalNumberOfExpressionExperiments: Number,
    maxDatasets: Number,
    progress: Number
  },
  data() {
    return {
      downloading: false,
      controller: null
    };
  },
  events: ["update:progress", "done", "cancel"],
  methods: {
    formatNumber,
    download() {
      let controller = new AbortController();
      let payload = Object.assign({}, this.browsingOptions);
      let promises = [];
      let progress_ = 0;
      let total = this.totalNumberOfExpressionExperiments;
      for (let offset = 0; offset < total; offset += this.maxDatasets) {
        payload.offset = offset;
        payload.limit = this.maxDatasets;
        promises.push(axiosInst.get(baseUrl + "/rest/v2/datasets", {
          signal: controller.signal,
          params: payload
        }).then((response) => {
          progress_ += (this.maxDatasets / total);
          this.$emit("update:progress", progress_);
          return response;
        }));
      }
      this.controller = controller;
      this.$emit("update:progress", 0);
      this.downloading = true;
      return Promise.all(promises)
        .then((responses) => {
          let data = responses
            .sort(response => response.offset)
            .map(response => response.data.data)
            .reduce((a, b) => a.concat(b), []);
          const termsAndConditionsHeader = [
            "# If you use this file for your research, please cite:",
            "# Lim et al. (2021) Curation of over 10 000 transcriptomic studies to enable data reuse.",
            "# Database, baab006 (doi:10.1093/database/baab006)."
          ];
          const browsingOptionsHeader = [
            JSON.stringify(this.browsingOptions)
          ];
          let csvHeader = termsAndConditionsHeader.join("\n") + "\n# Filter options=" + browsingOptionsHeader.join("\n");
          let csvContent = parse(data, {
            delimiter: "\t",
            quote: "",
            transforms: [(item) => {
              return {
                // id: item.id,
                short_name: item.shortName,
                taxon: item.taxon.commonName,
                title: item.name,
                number_of_samples: item.numberOfBioAssays,
                last_updated: item.lastUpdated
                // score: item.searchResult?.score,
                // highlights: item.searchResult?.highlights
              };
            }]
          });
          let csv = csvHeader + "\n" + csvContent;
          const timestamp = new Date().toLocaleString('sv').replace(/ |-|:/g, (match) => match === ' ' ? 'T' : '');
          const fileName = `datasets_${timestamp}.tsv`; // Update the file name
          downloadAs(new Blob([csv], { type: "text/tab-separated-values" }), fileName);
          this.$emit("done");
        }).catch((e) => {
          console.warn(e);
        }).finally(() => {
          this.downloading = false;
          this.$emit("update:progress", null);
        });
    },
    cancelDownload() {
      this.controller.abort();
      this.$emit("cancel");
    }
  }
};
</script>