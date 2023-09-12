<template>
    <div class="py-3">
        <h3>{{ dataset.name }}</h3>
        <template v-for="term in includedTerms">
            <v-chip v-if="isClickable(term)"
                    :key="getId(term)"
                    @click="isClickable(term) && handleChipClick(term) || null"
                    small :color="getChipColor(term.objectClass)"
                    :title="getTitle(term)"
                    class="mb-1 mr-1">
                {{ term.termName }}
                <v-icon v-if="isClickable(term)" right>mdi-plus</v-icon>
            </v-chip>
            <v-chip v-else :key="'else-' + getId(term)"
                    small :color="getChipColor(term.objectClass)"
                    :title="getTitle(term)"
                    class="mb-1 mr-1">
                {{ term.termName }}
            </v-chip>
        </template>
        <div v-html="this.description"></div>
    </div>
</template>

<script>
import { highlight } from "@/lib/highlight";
import { axiosInst, baseUrl, marked } from "@/config/gemma";
import { mapMutations, mapState } from "vuex";
import { getCategoryId, getTermId } from "@/lib/utils";
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
      return marked.parseInline(this.dataset.description);
    },
    chipColorMap() {
      return {
        FactorValue: "yellow lighten-3",
        ExperimentTag: "green lighten-3",
        BioMaterial: "blue lighten-3"
      };
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
      }).then(response => {
        return response.data.data;
      }).catch(error => {
        this.setLastError(error);
      });
    },
    getId(term) {
      return getCategoryId(term) + SEPARATOR + getTermId(term);
    },
    getTitle(term) {
      let n = this.getNumberOfExpressionExperiments(term);
      if (n > 0) {
        return `${term.objectClass} with ${n} datasets, click to add to filter`;
      } else {
        return `${term.objectClass}, click to add to filter`;
      }
    },
    /**
     * A term is selectable if three condition are met: it is an available choice, it is not already selected, and its
     * category as a whole is not already selected.
     * @param term
     * @returns {boolean}
     */
    isClickable(term) {
      return this.availableAnnotationIds.has(this.getId(term))
        && !this.selectedCategoryIds.has(getCategoryId(term))
        && !this.selectedAnnotationIds.has(this.getId(term));
    },
    handleChipClick(term) {
      this.$emit("chip-clicked", term);
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

        this.includedTerms = uniqueTerms
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