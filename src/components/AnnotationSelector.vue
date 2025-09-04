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
            <v-btn v-if="Object.keys(this.selection).filter((x,i)=>( Object.values(this.selection)[i] !== 0  )).length > 0" @click="clearSelection()" small text color="primary"
                   :disabled="disabled">
                Clear Selection
            </v-btn>
        </div>
        <v-progress-linear :active="loading" indeterminate/>
        <v-text-field v-model="search" dense label="Filter Annotations" outlined hide-details
                      prepend-inner-icon="filter_list" :disabled="disabled"
                      class="my-1"/>
        <v-treeview :items="rankedAnnotations" :disabled="disabled" item-key="id"
                    dense
                    :open.sync="open"
                    :search="search"
                    :filter="filter"
                    :class="debug ? '' : 'hide-root-checkboxes'"
        >
            <template v-slot:prepend="{item,leaf}">
              <v-icon
                  v-if="leaf || debug"
                  :disabled="disabled"
                  :class="iconForState(selection[item.id]|| 0)"
                  @click.stop="toggleSelection(item.id)"
                  :color="[-1,3].includes(selection[item.id]) ? 'red darken-3' : ''"
              >
              </v-icon>
            </template>
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
    selectedAnnotations:Array,
    negativeAnnotations: Array,
    selectedCategories:Array,
    negativeCategories:Array,
    additionalAnnotations:Array,
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
      dispatchedSelectedAnnotations:{},
      /**
       * Search for annotations.
       */
      search: null,
      selection:{},
      rootSelection: {},
      oldRoots: {},
      oldSelection:{},
      oldAnnotations:[],
      annotationComplete:{},
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
      return Object.values(this.annotationComplete)
        .map((a,i) => {
          let that = this;
          /**
           * Recursively construct a tree of annotations for a given category.
           */

          let relevantSelectedAnnots = Object.values(that.dispatchedSelectedAnnotations)
              .filter(annot=> annot.classUri === Object.values(that.annotationComplete)[i].classUri)
          let selectedUris = relevantSelectedAnnots.map(annot => annot.termUri);

          function getChildren(a) {
            let unrankedAnnots = a.children.map(c => {
              return {
                ...c,
                id: that.getId(c),
                isCategory: false,
                children: c.children ? c.children && getChildren(c) : null
              };
            })
            let unrankedUris = unrankedAnnots.map(annot => annot.termUri)
            unrankedAnnots = unrankedAnnots.concat(
                relevantSelectedAnnots
                    .filter(annot=>!unrankedUris.includes(annot.termUri))
            )
            return unrankedAnnots
                .sort((a, b) => {
              let a_select = selectedUris
                  .includes(a.termUri);
              let b_select = selectedUris
                  .includes(b.termUri);
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
            children: Object.keys(a.children).length >0 ? getChildren(a) : null
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
    markParent(id){
      let split_id = id.split("|")
      if(split_id.length > 1){
        if(split_id.length > 1){
          let selected =  Object.keys(this.selection).filter((x,i)=>( Object.values(this.selection)[i] === 1  ))
          let unselected =  Object.keys(this.selection).filter((x,i)=>( Object.values(this.selection)[i] === -1  ))

          let category = split_id[0]
          let child_ids = this.rankedAnnotations
              .filter(annot => {return annot.id === category})[0]
              .children.map(child=>child.id)

          // all/no children are selected are states 1,-1
          // some children selected/unselected are states 2,3
          // a mix of selected/unselected is state 4
          if (child_ids.every(c=>selected.includes(c))){
            this.$set(this.selection, category, 1);
          } else if (child_ids.every(c=>unselected.includes(c))){
            this.$set(this.selection, category, -1);
          } else if (child_ids.some(c=>selected.includes(c)) && !child_ids.some(c=>unselected.includes(c))){
            this.$set(this.selection, category, 2);
          } else if(child_ids.some(c=>unselected.includes(c)) && !child_ids.some(c=>selected.includes(c))) {
            this.$set(this.selection, category, 3);
          } else if(child_ids.some(c=>unselected.includes(c)) && child_ids.some(c=>selected.includes(c))){
            this.$set(this.selection, category, 4);
          } else{
            this.$set(this.selection, category, 0);
          }
        }
      }
    },
    clearSelection(){
      this.dispatchedSelectedAnnotations={};
      this.selection = {};
      this.rootSelection={}
    },
    toggleSelection(id){
      let current = this.selection[id] || 0;
      let next = current === 0 ? 1: current === 1 ? -1 : current === -1 ? 0: current === 2 ? 1 : current === 3 ? -1 : current === 4 ? 1 : 0
      this.$set(this.selection, id, next);

      // if a parent id is clicked, apply the change to all children
      this.rankedAnnotations
          .filter(annot => {return annot.id === id})
          .map(annot => {
            this.$set(this.rootSelection,annot.id,next)
            if (annot.children){
              annot.children.map(children => {
                this.$set(this.selection, children.id, next);
              })
            }
          })
      // clear stray terms in selection
      Object.keys(this.selection)
          .filter(k=>k.split("|")[0] === id)
          .map(k=>this.$set(this.selection,k,next))

      // if a child id is clicked, check it's parent to figure out how to mark it
      let split_id = id.split("|")
      if(split_id.length > 1){
        if(split_id.length > 1){
          let selected =  Object.keys(this.selection).filter((x,i)=>( Object.values(this.selection)[i] === 1  ))
          let unselected =  Object.keys(this.selection).filter((x,i)=>( Object.values(this.selection)[i] === -1  ))

          let category = split_id[0]
          let child_ids = this.rankedAnnotations
              .filter(annot => {return annot.id === category})[0]
              .children.map(child=>child.id)

          // all/no children are selected are states 1,-1
          // some children selected/unselected are states 2,3
          // a mix of selected/unselected is state 4
          if (child_ids.every(c=>selected.includes(c))){
            this.$set(this.selection, category, 1);
            this.$set(this.rootSelection,category,1);
          } else if (child_ids.every(c=>unselected.includes(c))){
            this.$set(this.selection, category, -1);
            this.$set(this.rootSelection,category,-1);
          } else if (child_ids.some(c=>selected.includes(c)) && !child_ids.some(c=>unselected.includes(c))){
            this.$set(this.selection, category, 2);
            this.$set(this.rootSelection,category,0);
          } else if(child_ids.some(c=>unselected.includes(c)) && !child_ids.some(c=>selected.includes(c))) {
            this.$set(this.selection, category, 3);
            this.$set(this.rootSelection,category,0);
          } else if(child_ids.some(c=>unselected.includes(c)) && child_ids.some(c=>selected.includes(c))){
            this.$set(this.selection, category, 4);
            this.$set(this.rootSelection,category,0);
          } else{
            this.$set(this.selection, category, 0);
            this.$set(this.rootSelection,category,0);
          }
        }
      }
    },
    iconForState(state){
      let box_class = "v-icon notranslate v-treeview-node__checkbox v-icon--link theme--light mdi "
      switch (state){
        case 1: return box_class + 'accent--text mdi-checkbox-marked';   // positive
        case -1: return box_class + 'mdi-close-box';       // negative
        case 2: return box_class + 'accent--text mdi-minus-box';
        case 3: return box_class + 'mdi-minus-box';
        case 4: return box_class + 'mdi-minus-box';
        default: return box_class + 'mdi-checkbox-blank-outline'; // unselected
      }
    },
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
      let marked = Object.keys(this.selection).filter((x,i)=>( Object.values(this.selection)[i] !== 0  ))
      let classUri = item.classUri;
      let selectedValuesClassUris = marked.map(Values => Values.split("|")[0]);
      return selectedValuesClassUris.filter(value => value.includes(classUri)).length-1;
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
          let a = this.annotationById[id] ? this.annotationById[id] : this.dispatchedSelectedAnnotations[id];
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
    computeSelectedCategories(newVal,annotations) {
      let s = new Set(newVal);
      return annotations
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
      let marked =   Object.keys(newVal).filter((x,i)=>( Object.values(newVal)[i] !== 0  ))
      let selected =  Object.keys(newVal).filter((x,i)=>( Object.values(newVal)[i] === 1  ))
      let unselected = Object.keys(newVal).filter((x,i)=>( Object.values(newVal)[i] === -1  ))

      // let oldMarked =   Object.keys(oldVal).filter((x,i)=>( Object.values(oldVal)[i] !== 0  ))
      let oldSelected =  Object.keys(oldVal).filter((x,i)=>( Object.values(oldVal)[i] === 1  ))
      let oldUnselected = Object.keys(oldVal).filter((x,i)=>( Object.values(oldVal)[i] === -1  ))

      let selectedRoots = Object.keys(this.rootSelection).filter((x,i)=>( Object.values(this.rootSelection)[i] === 1  ))
      let unselectedRoots = Object.keys(this.rootSelection).filter((x,i)=>( Object.values(this.rootSelection)[i] === -1  ))

      let oldSelectedRoots = Object.keys(this.oldRoots).filter((x,i)=>( Object.values(this.oldRoots)[i] === 1  ))
      let oldUnselectedRoots = Object.keys(this.oldRoots).filter((x,i)=>( Object.values(this.oldRoots)[i] === -1  ))

      let sc =  this.annotations.filter(annot=>selectedRoots.includes(annot.classUri))
      let sa = this.computeSelectedAnnotations(selected, sc);
      let scOld = this.annotations.filter(annot=>oldSelectedRoots.includes(annot.classUri))
      let saOld = this.computeSelectedAnnotations(oldSelected, scOld);
      if (!isEqual(sa.map(this.getId), saOld.map(this.getId))) {
        this.$emit("update:selectedAnnotations", sa);
      }
      if (!isEqual(selectedRoots, oldSelectedRoots)) {
        this.$emit("update:selectedCategories", sc);
      }
      let unSc = this.annotations.filter(annot=>unselectedRoots.includes(annot.classUri))
      let unsa = this.computeSelectedAnnotations(unselected,unSc);
      let unScOld = this.annotations.filter(annot=>oldUnselectedRoots.includes(annot.classUri))
      let unSaOld = this.computeSelectedAnnotations(oldUnselected,unScOld);
      if (!isEqual(unsa.map(this.getId), unSaOld.map(this.getId))) {
        this.$emit("update:negativeAnnotations", unsa);
      }
      if (!isEqual(unselectedRoots, oldUnselectedRoots)) {
        this.$emit("update:negativeCategories", unSc);
      }

      // assign old selection here instead of the main watcher since it can skip steps while
      // waiting for debounce otherise
      this.oldSelection = Object.assign({},newVal);
      this.oldAnnotations = this.annotations;
      this.oldRoots = Object.assign({},this.rootSelection);

      let allAnnots = this.rankedAnnotations.reduce((acc,annot)=>(acc.concat(annot.children)),[])
      let selectedIds = marked.filter(x => x.split(SEPARATOR).length>1)
      this.dispatchedSelectedAnnotations =  allAnnots
          .filter(annot=>annot)
          .filter(annot=>selectedIds.includes(annot.id))
          .reduce((acc,annot)=>{
            acc[annot.classUri+"|"+annot.termUri] = annot
            return acc
          },{})
    },1000)
  },
  watch: {
    annotations(newVal,oldVal){
      if (!isEqual(newVal,oldVal)) {
        let markedRoots = Object.keys(this.rootSelection).filter((x,i)=>( Object.values(this.rootSelection)[i] === 1 || Object.values(this.rootSelection)[i] === -1  ))
        let selectedRoots = Object.keys(this.rootSelection).filter((x,i)=>( Object.values(this.rootSelection)[i] === 1  ))
        let unselectedRoots = Object.keys(this.rootSelection).filter((x,i)=>( Object.values(this.rootSelection)[i] === -1  ))

        // clear previous dispatched list for root selections since we don't want to accumulate terms for no reason
        let dispatchAnnots = Object.assign({},this.dispatchedSelectedAnnotations)
        Object.values(dispatchAnnots)
            .filter((annot=>markedRoots.includes(annot.classUri)))
            .map(annot=>this.$delete(this.dispatchedSelectedAnnotations,annot.id))


        // if a root is selected, make sure any new additions are selected as well
        newVal
            .filter(annot=>selectedRoots.includes(annot.classUri))
            .map(annot=>{
              annot.children.map(child=>{
                this.$set(this.selection,this.getId(child),1)
              })
            })
        newVal
            .filter(annot=>unselectedRoots.includes(annot.classUri))
            .map(annot=>{
              annot.children.map(child=>{
                this.$set(this.selection,this.getId(child),-1)
              })
            })

        // add all terms to an annotationComplete object to keep track of missing parents,
        // set children and counts to zero when a parent goes missing
        // populate annotationComplete with missing IDs
        newVal.map(annot=>
            this.$set(this.annotationComplete,annot.classUri,annot)
        )
        let currentCats = newVal.map(annot=>annot.classUri)
        Object
           .keys(this.annotationComplete)
           .filter(key=>!currentCats.includes(key))
           .map(key=>{
             let annot = this.annotationComplete[key]
             annot.children = []
             annot.numberOfExpressionExperiments= 0
           })




        let newClasses = newVal.map(annot=>annot.classUri)
        let missingClasses = oldVal
            .filter(annot => !newClasses.includes(annot.classUri))
            .map(annot=>{
              annot.children = {}
              annot.numberOfExpressionExperiments = 0
              return annot
            })
        this.annotations.concat(missingClasses)

      }
    },
    additionalAnnotations(newVal,oldVal){
      let newIds = newVal.map(this.getId)
      let oldIds = oldVal.map(this.getId)
      let removedIds = oldIds.filter(id=>!newIds.includes(id))

      newIds.map(id=>{
        this.$set(this.selection,id,1)
      })

      removedIds.map(id=>{
        this.$set(this.selection,id,0)
      })

    },
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
    selection:{
      handler:function(newVal) {
        if (!isEqual(newVal, this.oldSelection)) {
          this.dispatchValues(newVal, this.oldSelection);
        }
      },
      deep: true
      }
  }
};
</script>

<style scoped>
.hide-root-checkboxes >>> .v-treeview-node__toggle + .v-treeview-node__checkbox {
    display: none !important;
}
>>> .v-treeview-node__prepend {
  min-width: 0;
}
</style>