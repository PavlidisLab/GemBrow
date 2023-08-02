<template>
    <v-treeview v-model="selectedValues" :items="rankedAnnotations" :disabled="disabled" item-key="id"
                selectable
                dense
                class="hide-root-checkboxes"
                >
        <template v-slot:label="{item}">
            <i v-if="item.isCategory && isUncategorized(item)">Uncategorized</i>
            <span v-else v-text="getTitle(item)" class="text-capitalize text-truncate"/>
            <span v-if="isTermLinkable(item)">&nbsp;<a v-if="debug" :href="getExternalUrl(item)" target="_blank"
                                                       class="mdi mdi-open-in-new"></a></span>
            <div v-if="debug && getUri(item)">
                <small>{{ getUri(item) }}</small>
            </div>
        </template>
        <template v-slot:append="{item}">
            <span v-if="!item.isCategory"
                  :title="debug ? 'Entropy: ' + formatDecimal(entropy(item)) : undefined"
            >
                {{ formatNumber(item.numberOfExpressionExperiments) }}
            </span>
        </template>
    </v-treeview>
</template>

<script>
import { chain, isEqual, max, sum } from "lodash";
import { formatDecimal, formatNumber } from "@/utils";
import { annotationSelectorOrderArray, ontologySources } from "@/config/gemma";
import { mapState } from "vuex";

/**
 * Separator used to constructing keys of nested elements in the tree view.
 * @type {string}
 */
const SEPARATOR = "|";

export default {
  name: "AnnotationSelector",
  props: {
    /**
     * Pre-selected annotations.
     *
     * Only selected terms are listed in the array, selected categories are handled separately.
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
       * An array of selected values formatted as "categoryId|termId".
       * @type Array
       */
      selectedValues: this.value.map(term => this.getId(term))
    };
  },
  emits: ["input", "update:selectedCategories"],
  computed: {
    /**
     * Quick reference for obtaining a term given its ID.
     */
    annotationById() {
      return chain(this.annotations)
        .flatMap(a => a.children)
        .groupBy(a => this.getId(a))
        .mapValues(a => a[0])
        .value();
    },
    /**
     * Annotations with IDs and ranked children.
     * @returns {(*&{isCategory: boolean, children: *, id: *})[]}
     */
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
          let that = this;

          /**
           * Recursively construct a tree of annotations for a given category.
           */
          function getChildren(a) {
            return a.children.map(c => {
              return {
                ...c,
                id: that.getId(c),
                isCategory: false,
                children: c.children && getChildren(c)
              };
            }).sort(byEntropy);
          }

          return {
            ...a,
            id: this.getCategoryId(a),
            isCategory: true,
            children: getChildren(a)
          };
        })
        .sort((a, b) => {
          if (a.classUri && b.classUri) {
            let aI = annotationSelectorOrderArray.indexOf(a.classUri);
            let bI = annotationSelectorOrderArray.indexOf(b.classUri);
            if(aI !== -1 && bI !== -1) {
              return aI - bI;
            } else if (aI !== -1) {
              return -1;
            } else if (bI !== -1) {
              return 1;
            } else {
               return 0;
            }
          } else if (a.classUri) {
            return -1;
          } else if (b.classUri) {
            return 1;
          } else {
            return 0;
          }
        });
    },
    ...mapState({
      debug: state => state.debug
    })
  },
  methods: {
    formatNumber,
    formatDecimal,
    /**
     * @returns {*|string|null} an ID for the category or null if the term is uncategorized
     */
    getCategoryId(term) {
      return term.classUri || term.className?.toLowerCase() || null;
    },
    getId(term) {
      return this.getCategoryId(term) + SEPARATOR + (term.termUri || term.termName?.toLowerCase());
    },
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
      return uri && ontologySources.some(source => source.pattern.test(uri));
    },
    /**
     * Produce an external link for a term.
     */
    getExternalUrl(item) {
      let uri = this.getUri(item);
      for (let source of ontologySources) {
        if (source.pattern.test(uri)) {
          return source.getExternalUrl(uri);
        }
      }
    },
    /**
     * Selected annotations, grouped by category and excluding selected categories.
     */
    computeSelectedAnnotations(newVal, selectedCategories) {
      let sc = new Set(selectedCategories.map(sc => this.getCategoryId(sc)));
      return newVal
        // exclude annotations from selected categories
        .filter(a => !sc.has(a.split(SEPARATOR, 2)[0]))
        .map(a => this.annotationById[a]);
    },
    /**
     * Selected categories.
     *
     * It's not possible to track selected categories directly because the selection mode of the tree view is leaf-only.
     * Thus, we rely on having all the terms within a category selected to infer that the category is selected.
     *
     * When other filters are applied, it may happen that a category becomes unexpectedly selected, so to prevent this
     * we require at least 10 terms in the category.
     */
    computeSelectedCategories(newVal) {
      let s = new Set(newVal);
      return this.annotations
        .filter(a => a.children.length > 10 && a.children.every(b => s.has(this.getId(b))))
        .map(a => ({ classUri: a.classUri, className: a.className }));
    }
  },
  watch: {
    selectedValues(newVal, oldVal) {
      let sc = this.computeSelectedCategories(newVal);
      let sa = this.computeSelectedAnnotations(newVal, sc);
      let scOld = this.computeSelectedCategories(oldVal);
      let saOld = this.computeSelectedAnnotations(oldVal, scOld);
      if (!isEqual(sa, saOld)) {
        this.$emit("input", sa);
      }
      if (!isEqual(sc, scOld)) {
        this.$emit("update:selectedCategories", sc);
      }
    }
  }
};
</script>

<style scoped>
.hide-root-checkboxes >>> .v-treeview-node__toggle + .v-treeview-node__checkbox {
display: none !important;
}

.hide-root-checkboxes >>> .v-treeview {
    max-width: 100%;
}

.hide-root-checkboxes >>> .v-treeview-node__children {
    max-height: 300px;
    overflow-y: auto;
}
</style>