<template>
    <div>
        <div class="d-flex align-baseline">
            <div class="text--secondary">
                Annotations
            </div>
            <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                    <v-icon v-bind="attrs" v-on="on" small class="ml-1">mdi-help-circle-outline</v-icon>
                </template>
                Counts in this section may be approximate. For more explanation see the help.
            </v-tooltip>
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
                <span v-else
                      class="text-truncate"
                      :title="getTitle(item).length > 30 && getTitle(item)"
                      v-html="getTitle(item)"></span>
                <span v-if="isTermLinkable(item)">&nbsp;<a v-if="debug" :href="getExternalUrl(item)" target="_blank"
                                                           class="mdi mdi-open-in-new"></a></span>
                <div v-if="debug && getUri(item)">
                    <small :style="isExcluded(item) ? 'text-decoration: line-through;' : ''">{{ getUri(item) }}</small>
                </div>
            </template>
            <template v-slot:append="{item}">
                <span v-if="!item.isCategory || debug"
                      class="text-right"><span v-if="!item.isCategory">≥</span>{{ formatNumber(item.numberOfExpressionExperiments) }}</span>
                <span v-if="item.isCategory && !debug && getNumberCategorySelections(item) > 0"
                      class="text-right text--secondary text-body-2">{{
                        getNumberCategorySelections(item)
                    }} selected</span>
            </template>
        </v-treeview>
        <p v-show="annotations.length === 0 && !loading">
            No annotations available
        </p>
    </div>
</template>

<script>
import { chain, debounce, isEqual } from "lodash";
import { formatNumber, getCategoryId, getTermId } from "@/lib/utils";
import { annotationSelectorOrderArray, excludedTerms, ontologySources } from "@/config/gemma";
import { mapState } from "vuex";
import pluralize from "pluralize";
import { titleCase } from "title-case";

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
      dispatchedSelected:[],
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
            }).sort((a, b) => {
              let a_select = that.dispatchedSelected.includes(a.termUri)
              let b_select = that.dispatchedSelected.includes(b.termUri)
              if (a_select === b_select){
                return b.numberOfExpressionExperiments - a.numberOfExpressionExperiments;
              } else{
                return b_select - a_select
              }

            });
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
            }
          } else if (a.classUri && annotationSelectorOrderArray.includes(a.classUri)) {
            return -1;
          } else if (b.classUri && annotationSelectorOrderArray.includes(b.classUri)) {
            return 1;
          }
          if (a.className && b.className) {
            return b.numberOfExpressionExperiments - a.numberOfExpressionExperiments;
            // return a.className.localeCompare(b.className);
          } else if (a.className) {
            return -1;
          } else if (b.className) {
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
      let fragments = pluralize.singular(search.toLowerCase()).split(" ");
      return fragments.every(fragment => this.getTitle(item).toLowerCase().includes(fragment) || this.getUri(item)?.toLowerCase() === fragment);
    },
    getId(term) {
      return getCategoryId(term) + SEPARATOR + getTermId(term);
    },
    isExcluded(item) {
      return excludedTerms.includes(item.classUri) || excludedTerms.includes(item.termUri);
    },
    isUncategorized(item) {
      return !item.className && !item.classUri;
    },
    getTitle(item) {
      // TODO: handle
      if (this.search && item.termName) {
        return this.highlightSearchTerm(titleCase(item.termName), this.search);
      }
      if (this.search && item.isCategory) {
        return ((item.className && this.highlightSearchTerm(titleCase(item.className), this.search)) || item.classUri || "");
      }
      return item.isCategory ? ((item.className && titleCase(pluralize(item.className))) || item.classUri || "") : (titleCase(item.termName) || item.termUri || "");
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
    getNumberCategorySelections(item) {
      let classUri = item.classUri;
      let selectedValuesClassUris = this.selectedValues.map(Values => Values.split("|")[0]);
      return selectedValuesClassUris.filter(value => value.includes(classUri)).length;
    },
    /**
     * Selected annotations, excluding those in selected categories.
     */
    computeSelectedAnnotations(newVal, selectedCategories) {
      let sc = new Set(selectedCategories.map(sc => getCategoryId(sc)));
      return newVal
        // exclude annotations from selected categories
        .filter(a => !sc.has(a.split(SEPARATOR, 2)[0]))
        .map(id => {
          let a = this.annotationById[id];
          if (!a) {
            console.warn(`Term ${id} is not selectable`);
          }
          return a;
        })
        .filter(a => a);
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
    },
    highlightSearchTerm(text, query) {
      const words = text.split(" ");
      const query_words = pluralize.singular(query).split(" ")
      const highlightedWords = words.map(word => {
        let query_contained = query_words.reduce((contains,q_word) => {
          return contains || word.toLowerCase().includes(q_word.toLowerCase())
        },false)
        if (query_contained) {
          return "<strong>"+ word + "</strong>"
        }
        return word;
      });
      return highlightedWords.join(" ");
    },
    dispatchValues:debounce(function(newVal,oldVal){
      let sc = this.computeSelectedCategories(newVal);
      let sa = this.computeSelectedAnnotations(newVal, sc);
      let scOld = this.computeSelectedCategories(oldVal);
      let saOld = this.computeSelectedAnnotations(oldVal, scOld);
      if (!isEqual(sa.map(this.getId), saOld.map(this.getId))) {
        this.$emit("input", sa);
      }
      if (!isEqual(sc.map(getCategoryId), scOld.map(getCategoryId))) {
        this.$emit("update:selectedCategories", sc);
      }
      // eslint-disable-next-line vue/no-mutating-props
      this.dispatchedSelected = this.selectedValues
          .map(x=>{return x.split(SEPARATOR)})
          .reduce((p,n)=>(p.concat(n)),[]);
    },1000)
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
    value(newVal) {
      // make sure that newVal is an option
      this.selectedValues = newVal.map(term => this.getId(term));
    },
    selectedValues:function(newVal, oldVal) {
      if(!isEqual(newVal,oldVal)){
        this.dispatchValues(newVal,oldVal)
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