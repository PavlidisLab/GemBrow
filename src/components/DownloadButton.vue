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
import { chain } from "lodash";
import { compressArg, downloadAs, formatNumber } from "@/utils";

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
  computed: {
    readableQuery() {
      return this.browsingOptions.query || "All datasets. ";
    },
    readableFilter() {
      let annotationByCategoryId = chain(this.searchSettings.annotations)
        .groupBy(t => t.classUri || t.className?.toLowerCase() || null)
        .values()
        .map(annotations => annotations.map(a => a.termName).join(", "))
        .join("; ")
        .value();
      let categories = this.searchSettings.categories.map(c => c.className).join("; ");
      let taxon = this.searchSettings.taxon?.scientificName;
      let platform = this.searchSettings.platform?.name;
      let browsingOptionsFilter = this.browsingOptions.filter;
      if (browsingOptionsFilter) {
        let browsingOptionsFilterReadable = [];
        if (annotationByCategoryId !== "" && annotationByCategoryId !== undefined) {
          browsingOptionsFilterReadable.push("Annotation: " + annotationByCategoryId + ".");
        }
        if (categories) {
          browsingOptionsFilterReadable.push("Category: " + categories + ".");
        }
        if (taxon) {
          browsingOptionsFilterReadable.push("Taxon: " + taxon + ".");
        }
        if (platform) {
          browsingOptionsFilterReadable.push("Platform: " + platform + ".");
        }
        return browsingOptionsFilterReadable.join(" ");
      } else {
        return "No filter applied. ";
      }
    }
  },
  methods: {
    formatNumber,
    download() {
      let payload = Object.assign({}, this.browsingOptions);
      let total = this.totalNumberOfExpressionExperiments;
      return compressArg(payload.filter).then(compressedFilter => {
        let controller = new AbortController();
        let promises = [];
        let progress_ = 0;
        for (let offset = 0; offset < total; offset += this.maxDatasets) {
          payload.filter = compressedFilter;
          payload.offset = offset;
          payload.limit = this.maxDatasets;
          promises.push(axiosInst.get(baseUrl + "/rest/v2/datasets", {
            signal: controller.signal,
            params: payload
          }).then((response) => {
            progress_ += (this.maxDatasets / total);
            this.$emit("update:progress", progress_);
            return response;
          })).catch(e => {
            controller.abort();
          });
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
            let csvHeader = termsAndConditionsHeader + "\n# QUERY: " + this.readableQuery + "\n# FILTERS: " + this.readableFilter;
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
            this.$emit("done");
          }).catch((e) => {
            console.warn(e);
          }).finally(() => {
            this.downloading = false;
            this.$emit("update:progress", null);
          });
      });
    },
    cancelDownload() {
      this.controller.abort();
      this.$emit("cancel");
    }
  }
};
</script>