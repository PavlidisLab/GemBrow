<template>
   <v-tabs v-model="selectedTab">
    <v-tab v-for="tab in snippetTabs" :key="tab.label" :label="tab.label" @click.stop=""> {{ tab.label }}
    </v-tab>
    <v-tab-item v-for="(tab, index) in snippetTabs" :key="tab.label" @click.stop=""> 
        <v-card flat v-if="selectedTab === index" max-width=650px>
        <v-card-text>
            <code>{{ tab.content }}</code>
        </v-card-text>
        <v-card-actions v-if="browsingOptions.query !== undefined || browsingOptions.filter !== ''">
            <v-btn type @click="copy(tab.content)">
              <v-icon>mdi-content-copy</v-icon>
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
        {label: "curl", content: this.queryCurl}, 
        {label: "Gemmapy", content: this.queryGemmapy}, 
        {label: "Gemma.R", content: this.queryGemmaR }
      ];

      // Modify the content based on the searchSettings prop
      let query = this.browsingOptions.query;
      let filter = this.browsingOptions.filter;
      let sort = this.browsingOptions.sort;


      // curl snippet
      let queryCurl = [];
      if (query !== undefined){ queryCurl.push(`query = '` + query) }; 
      if (filter !== undefined && filter.length > 0){ queryCurl.push(`filter = '` + filter + `', `) };
      if (queryCurl.length > 0) {
        if (sort !== undefined){ queryCurl.push(`sort = '` + sort + `', `) };
        queryCurl = `curl -X 'GET' 'https://gemma.msl.ubc.ca/rest/v2/annotations/mouse/search/datasets?${query}&offset=0&limit=20&sort=-lastUpdated' \
        -H 'accept: application/json'`
      } else {
        queryCurl = "No filters selected.";
      }
      tabs[0].content = queryCurl;

      // Gemmapy snippet
      let queryGemmapy = [];
      if (query !== undefined){ queryGemmapy.push(`query = '` + query + `', `) }; 
      if (filter !== undefined && filter.length > 0){ queryGemmapy.push(`filter = '` + filter + `', `) };
      if (queryGemmapy.length > 0) {
        if (sort !== undefined){ queryGemmapy.push(`sort = '` + sort + `', `) };
        queryGemmapy.unshift(`api_response = api_instance.get_datasets_by_ids(`);
        queryGemmapy.push(`)`);
      } else {
         queryGemmapy = ["No filters selected."];
      }
      tabs[1].content = queryGemmapy.join("").replace(/\,\s*\)/, ')');

      // Gemma.R snippet
      let queryGemmaR = [];
      if (query !== undefined){ queryGemmaR.push(`query = '` + query + `', `) }; 
      if (filter !== undefined && filter.length > 0){ queryGemmaR.push(`filter = '` + filter + `', `) };
      if (queryGemmaR.length > 0) {
        if (sort !== undefined){ queryGemmaR.push(`sort = '` + sort + `', `) };
        queryGemmaR.unshift(`data <- get_datasets_by_ids(`);
        queryGemmaR.push(`) %>% gemma.R:::get_all_pages()`);
      } else {
         queryGemmaR = ["No filters selected."];
      }
      tabs[2].content = queryGemmaR.join("").replace(/\,\s*\)/, ')');
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

</style>