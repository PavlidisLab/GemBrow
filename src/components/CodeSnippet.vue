<template>
   <v-tabs v-model="selectedTab">
    <v-tab v-for="tab in snippetTabs" :key="tab.label" :label="tab.label" @click.stop=""> {{ tab.label }}
    </v-tab>
    <v-tab-item v-for="(tab, index) in snippetTabs" :key="tab.label" @click.stop=""> 
        <v-card flat v-if="selectedTab === index">
        <v-card-text>
            <code>{{ tab.content }}</code>
        </v-card-text>
        <v-card-actions>
            <v-btn type @click="copy(tab.content)">Copy</v-btn>
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
      const taxon = this.searchSettings?.taxon?.commonName;
      const technologyType = this.searchSettings?.technologyType?.label;
      const platform = this.searchSettings?.platform?.name;
      console.log(platform)

      let tabQuery = [];
      if (taxon !== undefined){ tabQuery.push(`taxon = ` + taxon) } 
      console.log(`taxon added ` + tabQuery)       
      if (technologyType !== undefined){ tabQuery.push(technologyType) }
      console.log(`tech Type added ` + tabQuery) 
      if (platform !== undefined){ tabQuery.push(platform) }  
      console.log(`platform added ` + tabQuery)       
      if (tabQuery.length > 0) {
        console.log(tabQuery)
        tabQuery.unshift(`datasets <- get_datasets(`);
        console.log(`add R syntax ` + tabQuery) 
        tabQuery.push(`)`);
        console.log(`finish R syntax` + tabQuery) 
      } else {
         tabQuery = ["No filters selected"];
         console.log(`empty else` + tabQuery) 
      }

      tabs[2].content = tabQuery.join("");
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