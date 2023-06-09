<template>
    <v-treeview v-model="selectedAnnotations" :items="rankedAnnotations" :disabled="disabled" item-key="id"
                selectable
                dense>
        <template v-slot:label="{item}">
            <i v-if="item.isCategory && isUncategorized(item)">Uncategorized</i>
            <span v-else v-text="getTitle(item)" :title="getParentTerms(item)"
                  class="text-capitalize text-truncate"/>
            <span v-if="isTermLinkable(item)">&nbsp;<a :href="getExternalUrl(item)" target="_blank"
                                                       class="mdi mdi-open-in-new"></a></span>
            <div v-if="getUri(item)">
                <small>{{ getUri(item) }}</small>
            </div>
        </template>
        <template v-slot:append="{item}">
            <span v-if="!item.isCategory"
                  :title="'Entropy: ' + formatDecimal(entropy(item))"
            >
                {{ formatNumber(item.numberOfExpressionExperiments) }}
            </span>
        </template>
    </v-treeview>
</template>

<script>
import { flattenDeep, max, sum, uniq } from "lodash";
import { formatDecimal, formatNumber } from "@/utils";

export default {
  name: "AnnotationSelector",
  props: {
    /**
     * Pre-selected annotations.
     */
    value: Array,
    /**
     * Annotations to be displayed in this selector.
     */
    annotations: Array,
    /**
     * If true, the checkboxes in the tree view are disabled.
     */
    disabled: Boolean,
    /**
     * In order to rank annotations, we need to know how many datasets total are
     * matched.
     */
    totalNumberOfExpressionExperiments: Number
  },
  data() {
    return {
      /**
       * @type Array
       */
      selectedAnnotations: this.value
    };
  },
  emits: ["input", "update:selectedCategories"],
  computed: {
    rankedAnnotations() {
      let selectedAnnotations = new Set(this.selectedAnnotations);
      let byEntropy = (a, b) => {
        // prioritize selected annotations
        if (selectedAnnotations.has(a.id) !== selectedAnnotations.has(b.id)) {
          return selectedAnnotations.has(a.id) ? -1 : 1;
        }
        return this.entropy(b) - this.entropy(a);
      };
      return this.annotations
        .map(a => {
          return {
            ...a, children: a.children
              // never hide selected annotations
              // .filter(a => selectedAnnotations.has(a) || this.entropy(a) > 0.001)
              .sort(byEntropy)
          };
        })
        .filter(c => c.children.length > 0)
        .sort(byEntropy);
    },
    selectedCategories() {
      let s = new Set(this.selectedAnnotations);
      return this.rankedAnnotations
        .filter(a => a.children.every(b => s.has(b.id)))
        .map(a => a.id);
    }
  },
  methods: {
    formatNumber,
    formatDecimal,
    entropy(item) {
      if (this.isUncategorized(item)) {
        return 0;
      }
      if (item.isCategory) {
        // FIXME: because terms are not independent, we cannot sum their entropy
        return max(item.children.map(c => this.entropy(c)));
      }
      const p = item.numberOfExpressionExperiments / this.totalNumberOfExpressionExperiments;
      if (p === 0 || p === 1) {
        return 0;
      }
      let distribution = [p, 1 - p];
      return -sum(distribution.map(p => p * Math.log(p)));
    },
    isUncategorized(item) {
      return !item.className && !item.classUri;
    },
    getTitle(item) {
      // TODO: handle
      return item.isCategory ? (item.className || item.classUri) : (item.termName || item.termUri);
    },
    getUri(item) {
      return (item.isCategory ? item.classUri : item.termUri);
    },
    getParentTerms(item) {
      let collectParentTerms = function(item) {
        if (item.parentTerms) {
          return [item.parentTerms.map(t => t.name || t.uri), item.parentTerms.map(t => collectParentTerms(t))];
        } else {
          return [];
        }
      };
      return uniq(flattenDeep(collectParentTerms(item))).join(", ");
    },
    /**
     * Check if a term can be externally linked.
     */
    isTermLinkable(item) {
      let uri = this.getUri(item);
      return uri && (uri.startsWith("http://purl.obolibrary.org/") || uri.startsWith("http://www.ebi.ac.uk/") || uri.startsWith("http://purl.org/") || uri.startsWith("http://gemma.msl.ubc.ca/"));
    },
    /**
     * Produce an external link for a term.
     */
    getExternalUrl(item) {
      let uri = this.getUri(item);
      if (uri) {
        if (uri.startsWith("http://gemma.msl.ubc.ca/")) {
          // FIXME: add support for a minimal ontology browser (see https://github.com/PavlidisLab/Gemma/issues/342)
          return "https://gemma.msl.ubc.ca/ont/TGEMO.OWL";
        } else if (uri.startsWith("http://www.ebi.ac.uk/")) {
          return "https://www.ebi.ac.uk/ols/ontologies/efo/terms?iri=" + encodeURIComponent(uri);
        } else {
          return "https://ontobee.org/ontology/OBI?iri=" + encodeURIComponent(uri);
        }
      }
    }
  },
  watch: {
    selectedAnnotations(val) {
      this.$emit("input", val);
    },
    selectedCategories(val) {
      this.$emit("update:selectedCategories", val);
    }
  }
};
</script>

<style>
.v-treeview {
    max-width: 100%;
}

.v-treeview-node__children {
    max-height: 300px;
    overflow-y: auto;
}
</style>