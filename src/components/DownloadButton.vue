<template>
    <v-btn icon :loading="downloading" @click="download()">
        <v-icon>mdi-download</v-icon>
    </v-btn>
</template>

<script>
import { axiosInst, baseUrl } from "@/config/gemma";
import { parse } from "json2csv";
import { downloadAs } from "@/utils";

export default {
  name: "DownloadButton",
  props: {
    browsingOptions: Object,
    totalNumberOfExpressionExperiments: Number,
    maxDatasets: Number
  },
  data() {
    return {
      downloading: false
    };
  },
  methods: {
    download() {
      let payload = Object.assign({}, this.browsingOptions);
      let promises = [];
      for (let offset = 0; offset < this.totalNumberOfExpressionExperiments; offset += this.maxDatasets) {
        payload.offset = offset;
        payload.limit = this.maxDatasets;
        promises.push(axiosInst.get(baseUrl + "/rest/v2/datasets", {
          params: payload
        }));
      }
      this.downloading = true;
      return Promise.all(promises)
        .then((responses) => {
          let data = responses
            .sort(response => response.offset)
            .map(response => response.data.data)
            .reduce((a, b) => a.concat(b), []);
          let csv = parse(data, {
            delimiter: "\t",
            quote: "",
            transforms: [(item) => {
              return {
                id: item.id,
                short_name: item.shortName,
                taxon: item.taxon.commonName,
                title: item.name,
                number_of_samples: item.numberOfBioAssays,
                last_updated: item.lastUpdated,
                score: item.searchResult?.score,
                highlights: item.searchResult?.highlights
              };
            }]
          });
          downloadAs(new Blob([csv], { type: "text/tab-separated-values" }), "datasets.tsv");
        }).finally(() => {
          this.downloading = false;
        });
    }
  }
};
</script>