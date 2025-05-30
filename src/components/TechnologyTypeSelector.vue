<template>
    <div>
        <div class="d-flex align-baseline">
            <div class="text--secondary">Platforms</div>
            <v-spacer></v-spacer>
            <v-btn v-if="selectedValues.length > 0" @click="selectedValues = []" small text color="primary"
                   :disabled="disabled">
                Clear Selection
            </v-btn>
        </div>
        <v-progress-linear :active="loading" indeterminate/>
        <v-treeview v-model="selectedValues"
                    :items="technologyTypes"
                    :disabled="disabled"
                    item-key="id"
                    item-text="name"
                    selectable dense>
            <template v-slot:label="{item}">
                <span :title="item.name.length > 30 && item.name">{{ item.name }}</span>
            </template>
            <template v-slot:append="{item}">
                <div v-if="item.numberOfExpressionExperiments" class="text-right">
                    {{ formatNumber(item.numberOfExpressionExperiments) }}
                </div>
            </template>
        </v-treeview>
        <p v-show="technologyTypes.length === 0 && !loading">
            No platforms available
        </p>
    </div>
</template>

<script>

import { chain, debounce, isEqual } from "lodash";
import { formatNumber } from "@/lib/utils";
import { mapState } from "vuex";
import { TECH_ADDITIONS, TECHNOLOGY_TYPES, TOP_TECHNOLOGY_TYPES } from "@/lib/platformConstants";
import { titleCase } from "title-case";


export default {
  name: "TechnologyTypeSelector",
  props: {
    /**
     * Selected technology types.
     */
    value: Array,
    platforms: Array,
    annotations: Array,
    disabled: Boolean,
    loading: Boolean
  },
  techAdditions:Array,
  events: ["input"],
  data() {
    return {
      selectedValues: [],
      dispatchValues: debounce(function(newVal,oldVal){
        // had to move search into data to be able to flush debounce
        // https://stackoverflow.com/questions/52987115/using-vue-js-how-to-you-flush-a-method-that-is-debounced-with-lodash
        this.$emit("input", newVal)
        let ids = new Set(newVal.filter(id => !TECHNOLOGY_TYPES.includes(id)));
        let selectedTechnologyTypes = this.computeSelectedTechnologyTypes(ids);
        let selectedPlatforms = this.computeSelectedPlatforms(ids, selectedTechnologyTypes);
        let oldIds = new Set(oldVal.filter(id => !TECHNOLOGY_TYPES.includes(id)));
        let oldSelectedTechnologyTypes = this.computeSelectedTechnologyTypes(oldIds);
        let oldSelectedPlatforms = this.computeSelectedPlatforms(oldIds, oldSelectedTechnologyTypes);
        if (!isEqual(selectedPlatforms.map(p => p.id), oldSelectedPlatforms.map(p => p.id))) {
          this.$emit("update:selectedPlatforms", selectedPlatforms);
        }
        if (!isEqual(selectedTechnologyTypes, oldSelectedTechnologyTypes)) {
          this.$emit("update:selectedTechnologyTypes", selectedTechnologyTypes);
        }
        let selectedAdditionalAnnotations = this.computeSelectedAdditionalAnnotations(ids,selectedTechnologyTypes);
        let oldSelectedAdditionalAnnotations = this.computeSelectedAdditionalAnnotations(oldIds,oldSelectedTechnologyTypes);
        if(!isEqual(selectedAdditionalAnnotations,oldSelectedAdditionalAnnotations)) {
          this.$emit("update:additionalAnnotations", selectedAdditionalAnnotations);
        }
        },1000)
      }
  },
  computed: {
    techAdditions() {
      return Object.keys(TECH_ADDITIONS).map(class_uri => {
        return this.annotations.filter(category => category.classUri === class_uri).map(category => {
          return Object.keys(TECH_ADDITIONS[class_uri]).map(term_uri => {
            return category.children.filter(annotation => annotation.termUri === term_uri)
              .map(annotation => {
                return Object.assign({},
                  annotation,
                  {
                    "id": annotation.termUri,
                    "annotation": true,
                    "technologyType": TECH_ADDITIONS[class_uri][term_uri].parent,
                    "name": titleCase(annotation.termName)
                  });
              }).flat();
          }).flat();
        }).flat();
      }).flat();
    },
    technologyTypes() {
      return TOP_TECHNOLOGY_TYPES
        .filter(([id]) => id !== "OTHER" || this.debug)
        .map(([id, name, tts]) => {
          let platforms = this.platforms.filter(p => tts.includes(p.technologyType));
          let added_platforms = this.techAdditions.filter(p => tts.includes(p.technologyType));
          return {
            id: id,
            name: name,
            children: (id !== "RNA_SEQ" || this.debug) ? added_platforms.concat(platforms) : added_platforms,
            numberOfExpressionExperiments: chain(platforms)
              .groupBy("technologyType")
              .mapValues(v => v[0].numberOfExpressionExperimentsForTechnologyType)
              .values()
              .sum()
              .value()
          };
        }).filter(tt => tt.numberOfExpressionExperiments > 0);
    },
    ...mapState(["debug"])
  },
  methods: {
    formatNumber,
    computeSelectedPlatforms(ids, st) {
      return this.platforms
        .filter(p => ids.has(p.id))
        .filter(p => !st.includes(p.technologyType)); // exclude platforms which are already selected via technology type
    },
    computeSelectedTechnologyTypes(sv) {
      return this.technologyTypes
        .filter(v => sv.has(v.id) || (v.children.length > 0 && v.children.every(c => sv.has(c.id))))
        .flatMap(v => {
          for (let [id, _, tts] of TOP_TECHNOLOGY_TYPES) {
            if (v.id === id) {
              return tts;
            }
          }
          return [v.id];
        });
    },
    computeSelectedAdditionalAnnotations(ids,technologyTypes){
      return this.techAdditions
          .filter(v => ids.has(v.id))
          .filter(v => !technologyTypes.includes(v.technologyType))
    },
    flushDispatch: function(){
      this.dispatchValues.flush()
    }
  },
  watch: {
    technologyTypes(newVal,oldVal){
      if(!isEqual(newVal,oldVal)) {
        let ids = newVal.map(x => x.id).concat(newVal.map(x => x.children.map(y => y.id)).flat())
        // wait until the values are included in technology types
        // after terms are re-assigned
        if (this.value.length > 0 && this.value.map(x => ids.includes(x)).every(x => x)) {
          this.selectedValues = this.value
          this.dispatchValues(this.value, [])
          this.flushDispatch()
        }
      }
    },
    value(newVal){
      this.selectedValues = newVal;
    },
    selectedValues(newVal, oldVal) {
      if(!isEqual(newVal,oldVal)){
        this.dispatchValues(newVal,oldVal)

      }
    }
  }
};
</script>

