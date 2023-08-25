<template>
    <div>
        <div class="d-flex align-baseline">
            <div class="text--secondary">
                Annotations
            </div>
            <v-spacer></v-spacer>
            <v-btn v-if="selectedValues.length > 0" @click="selectedValues = []" small text color="primary"
                   :disabled="disabled">
                Clear Selection
            </v-btn>
        </div>
        <v-progress-linear :active="loading" indeterminate/>
        <v-text-field v-model="search" dense label="Filter Annotations" outlined hide-details
                      prepend-inner-icon="filter_list" :disabled="disabled"
                      class="my-1"/>
        <v-treeview v-model="selectedValues" :items="rankedAnnotations" :disabled="disabled" item-key="id"
                    selectable
                    dense
                    :open.sync="open"
                    :search="search"
                    :filter="filter"
                    :class="debug ? '' : 'hide-root-checkboxes'"
        >
            <template v-slot:label="{item}">
                <i v-if="item.isCategory && isUncategorized(item)">Uncategorized</i>
                <span v-else v-text="getTitle(item)" class="text-capitalize text-truncate"
                      :title="getTitle(item).length > 30 && getTitle(item)"/>
                <span v-if="isTermLinkable(item)">&nbsp;<a v-if="debug" :href="getExternalUrl(item)" target="_blank"
                                                           class="mdi mdi-open-in-new"></a></span>
                <div v-if="debug && getUri(item)">
                    <small :style="isExcluded(item) ? 'text-decoration: line-through;' : ''">{{ getUri(item) }}</small>
                </div>
            </template>
            <template v-slot:append="{item}">
                <div v-if="!item.isCategory || debug" class="text-right">
                    {{ formatNumber(item.numberOfExpressionExperiments) }}<br>
                </div>
            </template>
        </v-treeview>
        <p v-show="annotations.length === 0 && !loading">
            No annotations available
        </p>
    </div>
</template>

<script>
import { chain, isEqual, max } from "lodash";
import { formatNumber, getCategoryId, getTermId, pluralize } from "@/utils";
import { annotationSelectorOrderArray, excludedTerms, ontologySources } from "@/config/gemma";
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
    loading: Boolean,
    /**
     * If true, the checkboxes in the tree view are disabled.
     */
    disabled: Boolean
  },
  data() {
    return {
      /**
       * An array of selected values formatted as "categoryId|termId".
       * @type Array
       */
      selectedValues: this.value.map(term => this.getId(term)),
      /**
       * Search for annotations.
       */
      search: null,
      /**
       * A list of opened categories.
       */
      open: [],
      /**
       * A lits of previously opened categories when a search term is entered. This is used to restore opened categories
       * if the search is cleared.
       */
      previouslyOpen: []
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
      let byNumberOfExpressionExperiments = (a, b) => {
        return this.getNumberOfExpressionExperiments(b) - this.getNumberOfExpressionExperiments(a);
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
            }).sort(byNumberOfExpressionExperiments);
          }

          return {
            ...a,
            id: getCategoryId(a),
            isCategory: true,
            children: getChildren(a)
          };
        })
        .sort((a, b) => {
          if (a.classUri && b.classUri) {
            let aI = annotationSelectorOrderArray.indexOf(a.classUri);
            let bI = annotationSelectorOrderArray.indexOf(b.classUri);
            if (aI !== -1 && bI !== -1) {
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
    filter(item, search) {
      let fragments = search.toLowerCase().split(" ");
      return fragments.every(fragment => this.getTitle(item).toLowerCase().includes(fragment) || this.getUri(item)?.toLowerCase() === fragment);
    },
    getId(term) {
      return getCategoryId(term) + SEPARATOR + getTermId(term);
    },
    getNumberOfExpressionExperiments(item) {
      if (item.isCategory) {
        // FIXME: because terms are not independent, we cannot sum their number of expression experiments
        return max(item.children.map(c => this.getNumberOfExpressionExperiments(c))) || 0;
      } else {
        return item.numberOfExpressionExperiments;
      }
    },
    isExcluded(item) {
      return excludedTerms.includes(item.classUri) || excludedTerms.includes(item.termUri);
    },
    isUncategorized(item) {
      return !item.className && !item.classUri;
    },
    getTitle(item) {
      // TODO: handle
      return item.isCategory ? ((item.className && pluralize(item.className)) || item.classUri) : (item.termName || item.termUri);
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
      let sc = new Set(selectedCategories.map(sc => getCategoryId(sc)));
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
    search(newVal) {
      if (newVal) {
        if (this.previouslyOpen === null) {
          this.previouslyOpen = this.open;
        }
        // open everything!
        this.open = this.rankedAnnotations.map(a => a.id);
      } else {
        this.open = this.previouslyOpen;
        this.previouslyOpen = null;
      }
    },
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
</style>