<template>
    <div class="py-3">
        <h3>{{ dataset.name }}</h3>
        <v-chip v-for="term in availableAnnotationsIncludedTerms" 
                :key="term.termUri" @click="handleChipClick(term)" 
                small :color="getChipColor(term.objectClass)">
                {{ term.termName }} 
                <v-icon right>mdi-plus</v-icon>
          </v-chip> 
        <div v-html="this.description"></div>
    </div>
</template>

<script>
import { highlight } from "@/search-utils";
import { marked, axiosInst, baseUrl, excludedTerms, excludedCategories } from "@/config/gemma";

export default {
  name: "DatasetPreview",
  props: {
    dataset: Object,
    availableAnnotations: Array    
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
    },
    availableAnnotationsIncludedTerms() {
      return this.includedTerms.filter(term => {
        // Check if the termUri is included in any of the children arrays
        return this.availableAnnotations.some(annotation =>
          annotation.children.some(child => child.termUri === term.termUri)
        );
      });
    }
  },
  methods: {
    getTerms() {
      const dataset = this.dataset.id
      return axiosInst.request({
        method: 'GET',
          url: baseUrl + `/rest/v2/datasets/${dataset}/annotations`
        })
        .then(response => {
          return response.data.data;
        }).catch(error => {
          this.setLastError
      });
    },
    handleChipClick(term) {
      this.$emit('chip-clicked', term); 
    },
    getChipColor(objectClass) {
      return this.chipColorMap[objectClass] || 'orange'
    }
  },
  created() {
    this.getTerms().then(terms => {
      this.terms = terms;
      const seenTermUris = new Set(); // Log the URIs of objects in the terms array to omit duplicates and prevent duplicate URIs causing errors
      this.includedTerms = terms.filter(term => {
        if (!excludedTerms.includes(term.termUri) && !excludedCategories.includes(term.classUri) && !seenTermUris.has(term.termUri)) {
          seenTermUris.add(term.termUri);
          return true;
        } else {
          return false; 
        }
      });
    });
  }
};
</script>