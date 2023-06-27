<template>
    <v-treeview v-model="selectedValues" :items="rankedAnnotations" :disabled="disabled" item-key="id"
                selectable
                dense>
        <template v-slot:label="{item}">
            <i v-if="item.isCategory && isUncategorized(item)">Uncategorized</i>
            <span v-else v-text="getTitle(item)" class="text-capitalize text-truncate"/>
            <span v-if="isTermLinkable(item)">&nbsp;<a :href="getExternalUrl(item)" target="_blank"
                                                       class="mdi mdi-open-in-new"></a></span>
            <div v-if="debug && getUri(item)">
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
import { chain, isEqual, max, sum } from "lodash";
import { formatDecimal, formatNumber } from "@/utils";

export default {
  name: "AnnotationSelector",
  props: {
    /**
     * Pre-selected annotations, grouped by category.
     */
    value: Object,
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
    totalNumberOfExpressionExperiments: Number,
    debug: Boolean
  },
  data() {
    return {
      /**
       * An array of selected values formatted as "category|term".
       * @type Array
       */
      selectedValues: chain(this.value)
        .map((terms, category) => terms.map(term => `${category}|${term}`))
        .flatten()
        .value()
    };
  },
  emits: ["input", "update:selectedCategories"],
  computed: {
    rankedAnnotations() {
      let selectedValues = new Set(this.selectedValues);
      let byEntropy = (a, b) => {
        // prioritize selected annotations
        if (selectedValues.has(a.id) !== selectedValues.has(b.id)) {
          return selectedValues.has(a.id) ? -1 : 1;
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
        .sort((a, b) => {
          if (a.className && b.className) {
            return a.className.localeCompare(b.className);
          } else if (a.className) {
            return -1;
          } else if (b.className) {
            return 1;
          } else {
            return 0;
          }
        });
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
    },
    /**
     * Selected annotations, grouped by category and excluding selected categories.
     */
    computeSelectedAnnotations(newVal, selectedCategories) {
      let sc = new Set(selectedCategories);
      return chain(newVal)
        .map(a => a.split("|"))
        .filter(a => !sc.has(a[0]))
        .groupBy(a => a[0])
        .mapValues(a => a.map(b => b[1]))
        .value();
    },
    /**
     * Selected categories.
     */
    computeSelectedCategories(newVal) {
      let s = new Set(newVal);
      return this.annotations
        .filter(a => a.children.every(b => s.has(b.id)))
        .map(a => a.id);
    }
  },
  watch: {
    selectedValues(newVal, oldVal) {
      let sc = this.computeSelectedCategories(newVal);
      let sa = this.computeSelectedAnnotations(newVal, sc);
      let scOld = this.computeSelectedCategories(oldVal);
      let saOld = this.computeSelectedAnnotations(oldVal, scOld);
      if (!isEqual(sa, saOld)) {
        console.log("Selection changed", sa, saOld);
        this.$emit("input", sa);
      }
      if (!isEqual(sc, scOld)) {
        console.log("Selection changed", sc, scOld);
        this.$emit("update:selectedCategories", sc);
      }
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