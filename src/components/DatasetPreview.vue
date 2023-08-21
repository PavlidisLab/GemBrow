<template>
    <div class="py-3">
        <h3>{{ dataset.name }}</h3>
        <v-chip v-for="term in includedTerms" :key="term.termUri" @click="handleChipClick(term.termName)" small :color="getChipColor(term.objectClass)">{{ term.termName }} </v-chip> 
        <!--* 
          * Color code the chips to correspond to categories (which categories?)
          * Add termName/name of chip to search query on click
        -->
        <div v-html="this.description"></div>
    </div>
</template>

<script>
import { highlight } from "@/search-utils";
import { marked, axiosInst, baseUrl, excludedTerms, excludedCategories } from "@/config/gemma";

export default {
  name: "DatasetPreview",
  props: {
    dataset: Object    
  },
  data() {
    return {
      terms: [],
      includedTerms: []
    }
  },
  computed: {
    description() {
      if (this.dataset.searchResult !== undefined && this.dataset.searchResult.highlights !== null && "description" in this.dataset.searchResult.highlights) {
        return marked.parseInline(highlight(this.dataset.description, this.dataset.searchResult.highlights.description));
      }
      return marked.parseInline(this.dataset.description);
    },
    chipColorMap() {
      return {
        FactorValue: 'yellow',
        ExperimentTag: 'green',
        BioMaterial: 'blue'
      };
    }
  },
  methods: {
    getTerms() {
    const dataset = this.dataset.id
    return axiosInst.request({
      method: 'GET',
        url: baseUrl + `/rest/v2/datasets/${dataset}/annotations`,
        params: {
          filter: `id = ${dataset}`
        }
      })
      .then(response => {
        return response.data.data;
      }).catch(error => {
      });
   },
   handleChipClick(termName) {
    this.$emit('chip-clicked', termName); // Emit the termUri to the parent or other components
    },
    getChipColor(objectClass) {
      return this.chipColorMap[objectClass] || 'orange'
    }
  },
  created() {
    /** 
     * store the Name for any of the parent terms that are not selected as a chip below the title
    */ 
    this.getTerms().then(terms => {
      this.terms = terms;
      this.includedTerms = terms.filter(term => !excludedTerms.includes(term.termUri) && !excludedCategories.includes(term.classUri));
   });
  }
};
</script>