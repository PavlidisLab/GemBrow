<template>
   <v-tabs v-model="selectedTab" grow>
    <v-tab v-for="tab in snippetTabs" :key="tab.label" :label="tab.label" @click.stop=""> {{ tab.label }}
    </v-tab>
    <v-tab-item v-for="(tab) in snippetTabs" :key="tab.label" @click.stop=""> 
        <v-card flat max-width="650px" class="scroll">
          <v-card-subtitle>{{ tab.instructions }}</v-card-subtitle>
          <v-card-text>
            <highlightjs :language="tab.language" :code="tab.content"/>
          </v-card-text>
        <v-card-actions v-show="browsingOptions.query !== undefined || browsingOptions.filter !== ''">
            <v-btn type @click="copy(tab.content)">
              <v-icon>mdi-clipboard-outline</v-icon>
            </v-btn>
        </v-card-actions>
        </v-card>
    </v-tab-item>
    </v-tabs>
</template>

<script>

import { compressFilter } from "@/utils";

export default {
  name: "CodeSnippet",
  props: {
    browsingOptions: Object,
    searchSettings: Object,
    totalNumberOfExpressionExperiments: Number
  },
  data() {
    return {
      selectedTab: 0,
      compressedFilter: ''
    };
  },
  computed: {
    snippetTabs() {
      const tabs = [
        {label: "gemmapy", language: "python", instructions: 'Install the gemmapy package from Github and run the following code in a Python console.'}, 
        {label: "gemma.R", language: "r", instructions: `Install the gemma.R package from BioConductor and run the following code in an R console.` },
        {label: "curl", language: "bash", instructions: `Run the following code in a terminal (limit 100 datasets).`},
        {label: "HTTP/1.1", language: "http", instructions: `To use with your favourite HTTP client.`}
      ];

      // Modify the content based on the searchSettings prop
      let query = this.browsingOptions.query;
      let filter = this.browsingOptions.filter;
      let sort = this.browsingOptions.sort

      // Gemmapy snippet
      let queryGemmapy = [];
      if (query !== undefined){ 
        queryGemmapy.push(`query = '` + this.sanitizePyQuery(query) + `', `) }; 
      if (filter !== undefined && filter.length > 0){ queryGemmapy.push(`filter = '` + filter + `', `) };
      if (queryGemmapy.length > 0) {
        if (sort !== undefined){ queryGemmapy.push(`sort = '` + sort + `', offset = offset, limit = '100'`) };
        queryGemmapy.unshift(`import gemmapy\n` +
                              `api_instance = gemmapy.GemmaPy()\n` + 
                              `all_datasets = []\n` + 
                              `for offset in range(0, ${this.totalNumberOfExpressionExperiments}, 100):\n` +
                              `\tapi_response = api_instance.get_datasets_by_ids([],`);
        queryGemmapy.push(`)\n` +
                              `\tif api_response.data:\n` +
                                `\t\tall_datasets.extend(api_response.data)\n` +
                              `\telse:\n` +
                                `\t\tbreak`);
      }
      tabs[0].content = queryGemmapy.join("").replace(/\,\s*\)/, ')');

      // Gemma.R snippet
      let queryGemmaR = [];
      if (query !== undefined){ queryGemmaR.push(`query = '` + this.sanitizeRQuery(query) + `', `) }; 
      if (filter !== undefined && filter.length > 0){ queryGemmaR.push(`filter = '` + filter.map(subClauses => subClauses.join(" or ")).join(" and ") + `', `) };
      if (queryGemmaR.length > 0) {
        if (sort !== undefined){ queryGemmaR.push(`sort = '` + sort + `', `) };
        queryGemmaR.unshift(`library(gemma.R)\n` +
                            `library(dplyr)\n` + 
                            `data <- get_datasets_by_ids(`);
        queryGemmaR.push(`) %>% \n` +
        `gemma.R:::get_all_pages()`);
      } 
      tabs[1].content = queryGemmaR.join("").replace(/\,\s*\)/, ')');

      // curl snippet
      const params = new URLSearchParams();
      if (query !== undefined) {
        params.append('query', query);
      }
      if (filter.length > 0){
        params.append('filter', this.compressedFilter);
      }
      if (sort > 0){
        params.append('sort', sort);
      }
      const queryString = params.toString();
      const baseURL = 'https://dev.gemma.msl.ubc.ca/rest/v2/datasets'; // remove dev before deployment

      const queryCurl = `curl -X 'GET' --compressed '${baseURL}?${queryString}' -H 'accept: application/json'`; 
      tabs[2].content = queryCurl;

      // HTTP/1.1 snippet
      const queryHttp = `GET ${baseURL}?${queryString} HTTP/1.1\nHost: dev.gemma.msl.ubc.ca\nAccept: application/json`;
      tabs[3].content = queryHttp;
      
      return tabs;
    }
  },
  created() {
    compressFilter(this.browsingOptions.filter).then((result) => {
      this.compressedFilter = result;
      });
  },
  watch: {
  'browsingOptions': function(newVal) {
    compressFilter(newVal.filter).then((result) => {
      this.compressedFilter = result;
      });
    },
    selectedTab() {
      this.$emit("resize");
    }
  },
  methods: {
    copy(content) {
        // copy the snippet to the clipboard
        navigator.clipboard.writeText(content);
        },
    sanitizeRQuery(query) {
      return query.replace(/['"[{()},;!$&@#]/g, "\\$&");
    },
    sanitizePyQuery(query) {
      return query.replace(/['"[{()},;!$&@]/g, "\\$&");
    }
  }
};
</script>

<style scoped>
.scroll {
  overflow-y: scroll;
  max-height: calc(100vh - 100px);
}
</style>