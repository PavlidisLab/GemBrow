<template>
    <div class="py-3">
        <h3>{{ dataset.name }}</h3>
        <v-chip v-for="term in terms" :key="term.termUri">{{ term.termName }}</v-chip> 
        <!--* 
          * Add the termName and parentName values as chips
          * Color code the chips to correspond to categories (which categories?)
          * Add termName/name of chip to search query on click
        -->
        <div v-html="this.description"></div>
    </div>
</template>

<script>
import { highlight } from "@/search-utils";
import { marked, axiosInst, baseUrl } from "@/config/gemma";

export default {
  name: "DatasetPreview",
  props: {
    dataset: Object    
  },
  data() {
    return {
      terms: []
    }
  },
  computed: {
    description() {
      if (this.dataset.searchResult !== undefined && this.dataset.searchResult.highlights !== null && "description" in this.dataset.searchResult.highlights) {
        return marked.parseInline(highlight(this.dataset.description, this.dataset.searchResult.highlights.description));
      }
      return marked.parseInline(this.dataset.description);
    }
  },
  methods: {
    getTerms() {
    const dataset = this.dataset.id
    console.log('dataset', dataset)
    return axiosInst.request({
      method: 'GET',
        url: baseUrl + `/rest/v2/datasets/annotations`,
        params: {
          filter: `id = ${dataset}`
        }
      })
      .then(response => {
        console.log('datasets/annotations endpoint data', response.data);
        return response.data.data;
      }).catch(error => {
        console.error('Failed to get datasets/annotations endpoint data', error);
      });
   }
  },
  created() {
    /** 
     * Dispatch the API request when the user opens the dataset preview window 
     * Query the dataset/annotation endpoint (getTerms())
     * store termName for selected experiment
     * store the Name for any of the parent terms that are not selected as a chip below the title
    */ 
   console.log('this.dataset', this.dataset)
   this.getTerms().then(terms => {
    this.terms = terms;
   });
  }
};
</script>