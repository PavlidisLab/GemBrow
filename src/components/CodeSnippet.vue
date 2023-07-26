<template>
   <v-tabs v-model="selectedTab">
    <v-tab v-for="tab in snippetTabs" :key="tab.label" :label="tab.label" @click.stop=""> {{ tab.label }}
    </v-tab>
    <v-tab-item v-for="(tab, index) in snippetTabs" :key="tab.label" @click.stop=""> 
        <v-card flat v-if="selectedTab === index" max-width=650px class="scroll">
          <v-card-text>
            <highlightjs :language="tab.language" :code="tab.content"/>
          </v-card-text>
        <v-card-actions v-if="browsingOptions.query !== undefined || browsingOptions.filter !== ''">
            <v-btn type @click="copy(tab.content)">
              <v-icon>mdi-clipboard-outline</v-icon>
            </v-btn>
        </v-card-actions>
        </v-card>
    </v-tab-item>
    </v-tabs>
</template>

<script>

export default {
  name: "CodeSnippet",
  props: {
    browsingOptions: Object,
    searchSettings: Object
  },
  data() {
    return {
      selectedTab: 0
    };
  },
  computed: {
    snippetTabs() {
      return this.generateSnippetTabs();
    }
  },
  watch: {
    selectedTab() {
      this.updateSnippet();
    }
  },
  methods: {
    generateSnippetTabs() {
      // generate the snippet tabs
      const tabs = [
        {label: "Gemmapy", content: this.queryGemmapy, language: "python"}, 
        {label: "Gemma.R", content: this.queryGemmaR, language: "r" },
        {label: "curl", content: this.queryCurl, language: "bash"}
      ];

      // Modify the content based on the searchSettings prop
      let query = this.browsingOptions.query;
      let filter = this.browsingOptions.filter;
      let sort = this.browsingOptions.sort;

      // Gemmapy snippet
      let queryGemmapy = [];
      if (query !== undefined){ queryGemmapy.push(`query = '` + query + `', `) }; 
      if (filter !== undefined && filter.length > 0){ queryGemmapy.push(`filter = '` + filter + `', `) };
      if (queryGemmapy.length > 0) {
        if (sort !== undefined){ queryGemmapy.push(`sort = '` + sort + `', offset = offset, limit = '100'`) };
        queryGemmapy.unshift(`import gemmapy\n` +
                              `api_instance = gemmapy.GemmaPy()\n` + 
                              `offset = 0\n` + 
                              `all_datasets = []\n` + 
                              `while True:\n` +
                              `\tapi_response = api_instance.get_datasets_by_ids([],`);
        queryGemmapy.push(`)\n` +
                              `\tif api_response.data:\n` +
                                `\t\tall_datasets.extend(api_response.data)\n` +
                                `\t\toffset += 100\n` +
                              `\telse:\n` +
                                `\t\tbreak`);
      } else {
         queryGemmapy = ["No filters selected."];
      }
      tabs[0].content = queryGemmapy.join("").replace(/\,\s*\)/, ')');

      // Gemma.R snippet
      let queryGemmaR = [];
      if (query !== undefined){ queryGemmaR.push(`query = '` + query + `', `) }; 
      if (filter !== undefined && filter.length > 0){ queryGemmaR.push(`filter = '` + filter + `', `) };
      if (queryGemmaR.length > 0) {
        if (sort !== undefined){ queryGemmaR.push(`sort = '` + sort + `', `) };
        queryGemmaR.unshift(`library(gemma.R)\n` +
                            `library(dplyr)\n` + 
                            `data <- get_datasets_by_ids(`);
        queryGemmaR.push(`) %>% \n` +
        `gemma.R:::get_all_pages()`);
      } else {
         queryGemmaR = ["No filters selected."];
      }
      tabs[1].content = queryGemmaR.join("").replace(/\,\s*\)/, ')');

      // curl snippet
      let encodedQuery = '';
      if (query !== undefined) {
        encodedQuery = 'query=' + encodeURIComponent(query);
      }

      let encodedFilter = '';
      if (filter.length > 0){ 
        encodedFilter = '&filter=' + encodeURIComponent(filter);
      }
      
      let encodedSort = ''
      if (sort !== '-lastUpdated'){
        encodedSort = '&sort=' + encodeURIComponent(sort)
      } else {
        encodedSort = '&sort=' + encodeURIComponent('-lastUpdated')
      };

      let queryCurl = '';
      if (query!== undefined || filter.length > 0) {
        queryCurl = `curl -X 'GET' --compressed 'https://dev.gemma.msl.ubc.ca/rest/v2/datasets?${encodedQuery}${encodedFilter}&offset=0&${encodedSort}' -H 'accept: application/json'` // remove dev before deployment
      } else {
        queryCurl = "No filters selected.";
      }
      tabs[2].content = queryCurl;

      return tabs;
    },
    updateSnippet() {
        // update the snippet based on the language selected
        let selectedTabLabel = this.snippetTabs[this.selectedTab]?.label;
        switch (selectedTabLabel) {
            case "curl":
                this.snippet = this.queryCurl;
                break;
            case "Gemmapy":
                this.snippet = this.queryGemmapy;
                break;
            case "Gemma.R":
                this.snippet = this.queryGemmaR;
                break;
            }
        },
        copy(content) {
        // copy the snippet to the clipboard
        navigator.clipboard.writeText(content);
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