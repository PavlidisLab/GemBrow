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

import { chain, isEqual } from "lodash";
import { formatNumber } from "@/lib/utils";
import { mapState } from "vuex";

const MICROARRAY_TECHNOLOGY_TYPES = ["ONECOLOR", "TWOCOLOR", "DUALMODE"];
const RNA_SEQ_TECHNOLOGY_TYPES = ["SEQUENCING"];
const OTHER_TECHNOLOGY_TYPES = ["GENELIST", "OTHER"];
const TECHNOLOGY_TYPES = MICROARRAY_TECHNOLOGY_TYPES + RNA_SEQ_TECHNOLOGY_TYPES + OTHER_TECHNOLOGY_TYPES;
const TOP_TECHNOLOGY_TYPES = [
  ["RNA_SEQ", "RNA-Seq", RNA_SEQ_TECHNOLOGY_TYPES],
  ["MICROARRAY", "Microarray", MICROARRAY_TECHNOLOGY_TYPES],
  ["OTHER", "Other", OTHER_TECHNOLOGY_TYPES]];

export default {
  name: "TechnologyTypeSelector",
  props: {
    /**
     * Selected technology types.
     */
    value: Array,
    platforms: Array,
    disabled: Boolean,
    loading: Boolean
  },
  events: ["input"],
  data() {
    return {
      selectedValues: this.value.map(t => t.id)
    };
  },
  computed: {
    technologyTypes() {
      return TOP_TECHNOLOGY_TYPES
        .filter(([id]) => id !== "OTHER" || this.debug)
        .map(([id, name, tts]) => {
          let platforms = this.platforms.filter(p => tts.includes(p.technologyType));
          return {
            id: id,
            name: name,
            children: (id !== "RNA_SEQ" || this.debug) ? platforms : [],
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
    }
  },
  watch: {
    selectedValues(newVal, oldVal) {
      let ids = new Set(newVal.filter(id => !TECHNOLOGY_TYPES.includes(id)));
      let selectedTechnologyTypes = this.computeSelectedTechnologyTypes(ids);
      let selectedPlatforms = this.computeSelectedPlatforms(ids, selectedTechnologyTypes);
      let oldIds = new Set(oldVal.filter(id => !TECHNOLOGY_TYPES.includes(id)));
      let oldSelectedTechnologyTypes = this.computeSelectedTechnologyTypes(oldIds);
      let oldSelectedPlatforms = this.computeSelectedPlatforms(oldIds, oldSelectedTechnologyTypes);
      if (!isEqual(selectedPlatforms.map(p => p.id), oldSelectedPlatforms.map(p => p.id))) {
        this.$emit("input", selectedPlatforms);
      }
      if (!isEqual(selectedTechnologyTypes, oldSelectedTechnologyTypes)) {
        this.$emit("update:selectedTechnologyTypes", selectedTechnologyTypes);
      }
    }
  }
};
</script>

