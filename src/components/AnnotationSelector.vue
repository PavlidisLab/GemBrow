<template>
    <v-treeview v-model="selectedAnnotations" :items="rankedAnnotations" :disabled="disabled" item-key="id"
                selectable
                dense>
        <template v-slot:label="{item}">
            <i v-if="item.isCategory && isUncategorized(item)">Uncategorized</i>
            <span v-else v-text="getTitle(item)" style="text-transform: capitalize;"/>
            <br>
            <small v-text="getUri(item)" :title="getUri(item)"/>
        </template>
        <template v-slot:append="{item}">
            <span v-if="!item.isCategory"
                  :title="'Entropy: ' + formatNumber(entropy(item))"
            >
                {{ item.numberOfExpressionExperiments }}
            </span>
        </template>
    </v-treeview>
</template>

<script>
import { max, sum } from "lodash";

const numberFormatter = Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

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
              .filter(a => selectedAnnotations.has(a) || this.entropy(a) > 0.001)
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
    entropy(item) {
      if (this.isUncategorized(item)) {
        return 0;
      }
      if (item.isCategory) {
        // FIXME: because terms are not independent, we cannot sum their entropy
        return max(item.children.map(c => this.entropy(c)));
      }
      const p = item.numberOfExpressionExperiments / this.totalNumberOfExpressionExperiments;
      let distribution = [p, 1 - p];
      return -sum(distribution.map(p => p * Math.log(p)));
    },
    formatNumber(e) {
      return numberFormatter.format(e);
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