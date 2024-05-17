<template>
    <div class="py-3">
        <h3> <a v-bind:href="datasetUrl" target="_blank">{{ dataset.shortName }}</a>: {{ dataset.name }}</h3>
        <v-chip v-for="term in includedTerms" :key="getId(term)"
                @[getClickEventName(term)]="handleChipClick(term)"
                small :color="getChipColor(term.objectClass)"
                :title="getTitle(term)"
                class="text-capitalize mb-1 mr-1">
            {{ term.termName }}
            <v-icon v-if="isSelectable(term)" right>mdi-plus</v-icon>
            <v-icon v-else-if="isUnselectable(term)" right>mdi-minus</v-icon>
        </v-chip>
        <div v-html="this.description"></div>
    </div>
</template>

<script>
import { highlight } from "@/lib/highlight";
import { axiosInst, baseUrl, marked } from "@/config/gemma";
import { mapMutations, mapState } from "vuex";
import { getCategoryId, getTermId, swallowCancellation } from "@/lib/utils";
import { chain } from "lodash";


/**
 * Separator used to constructing keys of nested elements in the tree view.
 * @type {string}
 */
const SEPARATOR = "|";

/**
 * Priority to use for sorting terms by object class.
 */
const OBJECT_CLASS_PRIORITY = {
  BioMaterial: 0,
  ExperimentTag: 1,
  FactorValue: 2
};

export default {
  name: "DatasetPreview",
  props: {
    dataset: Object,
    selectedCategories: Array,
    selectedAnnotations: Array,
    availableAnnotations: Array
  },
  events: ["annotation-selected", "annotation-unselected"],
  data() {
    return {
      includedTerms: []
    };
  },
  computed: {
    description() {
      if (this.dataset.searchResult !== undefined && this.dataset.searchResult.highlights !== null && "description" in this.dataset.searchResult.highlights) {
        return marked.parseInline(highlight(this.dataset.description, this.dataset.searchResult.highlights.description));
      }
      let ds = this.dataset.description
      let words = ds.split(" ")
      if(words.length>150){
        words = words.slice(0,150)
        ds = words.join(" ") + "…"
      }
      return marked.parseInline(ds);
    },
    chipColorMap() {
      return {
        FactorValue: "yellow lighten-3",
        ExperimentTag: "green lighten-3",
        BioMaterial: "blue lighten-3"
      };
    },
    datasetUrl(){
      return baseUrl + "/expressionExperiment/showExpressionExperiment.html?id=" + this.dataset.id
    },
    /**
     * IDs of selected categories.
     */
    selectedCategoryIds() {
      return new Set(this.selectedCategories.map(getCategoryId));
    },
    /**
     * IDs of annotations already selected.
     */
    selectedAnnotationIds() {
      return new Set(this.selectedAnnotations.map(this.getId));
    },
    /**
     *
     * @returns {Set<T>}
     */
    availableAnnotationIds() {
      return new Set(this.availableAnnotations.flatMap(c => c.children).map(this.getId));
    },
    availableAnnotationsById() {
      return Object.fromEntries(this.availableAnnotations.flatMap(c => c.children).map(a => [this.getId(a), a]));
    },
    ...mapState({
      debug: state => state.debug
    })
  },
  methods: {
    ...mapMutations(["setLastError"]),
    getTerms() {
      const dataset = this.dataset.id;
      return axiosInst.request({
        method: "GET",
        url: baseUrl + `/rest/v2/datasets/${dataset}/annotations`
      }).then(response => response.data.data)
        .catch(swallowCancellation)
        .catch((err) => {
          console.error(`Failed to retrieve annotations for ${dataset}: ${err.message}`, err);
          this.setLastError(err);
        });
    },
    getClickEventName(term) {
      return (this.isSelectable(term) || this.isUnselectable(term)) ? "click" : null;
    },
    getId(term) {
      return getCategoryId(term) + SEPARATOR + getTermId(term);
    },
    getTitle(term) {
      let n = this.getNumberOfExpressionExperiments(term);
      if (term.termUri !== null) { // if the term is not free text
        if (n > 0) {
          return `${term.className.charAt(0).toUpperCase() + term.className.slice(1)}: ${term.termUri} via ${term.objectClass}; click to add terms to filter (associated with ${n} datasets)`;
        } else {
          return `${term.className.charAt(0).toUpperCase() + term.className.slice(1)}: ${term.termUri} via ${term.objectClass}`;
        }
      } else {
        if (n > 0) {
          return `${term.className.charAt(0).toUpperCase() + term.className.slice(1)}: Free text via ${term.objectClass}; click to add terms to filter (associated with ${n} datasets)`;
        } else {
          return `${term.className.charAt(0).toUpperCase() + term.className.slice(1)}: Free text via ${term.objectClass}`;
        }
      }
    },
    /**
     * A term is selectable if three condition are met: it is an available choice, it is not already selected, and its
     * category as a whole is not already selected.
     * @param term
     * @returns {boolean}
     */
    isSelectable(term) {
      return this.availableAnnotationIds.has(this.getId(term))
        && !this.selectedCategoryIds.has(getCategoryId(term))
        && !this.selectedAnnotationIds.has(this.getId(term));
    },
    isUnselectable(term) {
      return this.selectedAnnotationIds.has(this.getId(term));
    },
    handleChipClick(term) {
      if (this.isSelectable(term)) {
        this.$emit("annotation-selected", term);
      } else if (this.isUnselectable(term)) {
        this.$emit("annotation-unselected", term);
      } else {
        console.warn(`Term ${term} cannot be unselected.`, term);
      }
    },
    getChipColor(objectClass) {
      return this.chipColorMap[objectClass] || "orange";
    },
    getNumberOfExpressionExperiments(term) {
      let id = this.getId(term);
      return this.availableAnnotationsById[id]?.numberOfExpressionExperiments || 0;
    },
    updateTerms() {
      this.includedTerms = [];
      this.getTerms().then(terms => {
        const uniqueTerms = chain(terms)
          .sort((a, b) => OBJECT_CLASS_PRIORITY[a.objectClass] - OBJECT_CLASS_PRIORITY[b.objectClass])
          .groupBy(term => getCategoryId(term) + SEPARATOR + getTermId(term))
          .mapValues(terms => terms[0])
          .values()
          .value();

        this.includedTerms = uniqueTerms;
      });
    }
  },
  created() {
    this.updateTerms();
  },
  watch: {
    dataset(newVal, oldVal) {
      if (newVal.id !== oldVal.id) {
        this.updateTerms();
      }
    }
  }
};
</script>