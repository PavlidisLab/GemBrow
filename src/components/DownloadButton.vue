<template>
    <div>
        <v-btn v-if="!downloading" @click="download()" icon
               :title="'Download metadata for ' + formatNumber(totalNumberOfExpressionExperiments) + ' datasets'">
            <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn v-if="downloading" @click="cancelDownload()" icon
        :title="'Cancel the metadata download of ' + formatNumber(total) + ' datasets'">
            <v-icon>mdi-cancel</v-icon>
        </v-btn>
    </div>
</template>

<script>
import { axiosInst, baseUrl } from "@/config/gemma";
import { parse } from "json2csv";
import { chain } from "lodash";
import { compressFilter, downloadAs, formatNumber, getCategoryId } from "@/utils";
import axios from "axios";

const termsAndConditionsHeader = [
  "# If you use this file for your research, please cite:",
  "# Lim et al. (2021) Curation of over 10 000 transcriptomic studies to enable data reuse.",
  "# Database, baab006 (doi:10.1093/database/baab006)."
].join("\n");

export default {
  name: "DownloadButton",
  props: {
    /**
     * Browsing options to use for downloading datasets.
     */
    browsingOptions: Object,
    searchSettings: Object,
    totalNumberOfExpressionExperiments: Number,
    progress: Number,
    filterDescription: String
  },
  data() {
    return {
      downloading: false,
      controller: null,
      total: this.totalNumberOfExpressionExperiments
    };
  },
  events: ["update:progress"],
  methods: {
    formatNumber,
    download() {
      if (this.downloading) {
        return;
      }
      this.downloading = true;
      let filter = this.browsingOptions.filter;
      let limit = 100;
      let sort = this.browsingOptions.sort;
      let total = this.total = this.totalNumberOfExpressionExperiments;
      return compressFilter(filter).then(compressedFilter => {
        let controller = this.controller = new AbortController();
        let progress_ = 0;
        this.$emit("update:progress", progress_);

        // create one promise per slice
        let promises = [];
        for (let offset = 0; offset < total; offset += limit) {
          let payload = {
            filter: compressedFilter,
            offset: offset,
            limit: limit,
            sort: sort
          };
          promises.push(axiosInst.get(baseUrl + "/rest/v2/datasets", {
            signal: controller.signal,
            params: payload
          }).then((response) => {
            progress_ += (limit / total);
            this.$emit("update:progress", progress_);
            return response;
          }).catch(e => {
            // make sure that all other pending promises are also aborted
            if (!axios.isCancel(e)) {
              console.info("Cancelled all other pending requests...");
              controller.abort();
            }
            throw e;
          }));
        }

        return Promise.all(promises)
          .then((responses) => {
            let data = responses.flatMap(response => response.data.data);
            let formattedFilterDescription = this.filterDescription.replace(/\n/g, ""); 
            let csvHeader = termsAndConditionsHeader + "\n# " + formattedFilterDescription;
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
            const timestamp = new Date().toISOString();
            const fileName = `datasets_${timestamp}.tsv`; // Update the file name
            downloadAs(new Blob([csv], { type: "text/tab-separated-values" }), fileName);
          });
      }).catch(err => {
        if (!axios.isCancel(err)) {
          console.error("Error while downloading datasets to TSV: " + err.message + ".", err);
        }
      }).finally(() => {
        this.downloading = false;
        this.controller = null;
        this.$emit("update:progress", null);
      });
    },
    cancelDownload() {
      this.controller.abort();
    }
  }
};
</script>