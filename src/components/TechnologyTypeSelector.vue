<template>
    <div>
        <div class="d-flex align-baseline">
            <div class="text--secondary">Technology Types</div>
            <v-spacer></v-spacer>
            <v-btn v-if="selectedValues.length > 0" @click="selectedValues = []" small text color="primary" :disabled="disabled">
                Clear Selection
            </v-btn>
        </div>
        <v-treeview v-model="selectedValues"
                    :items="technologyTypes"
                    :disabled="disabled"
                    item-key="id"
                    item-text="name"
                    selectable dense>
            <template v-slot:label="{item}">
                {{ item.name }}
            </template>
            <template v-slot:append="{item}">
                {{ item.numberOfExpressionExperiments }}
            </template>
        </v-treeview>
    </div>
</template>

<script>

import { isEqual, sumBy } from "lodash";

const MICROARRAY_TECHNOLOGY_TYPES = ["ONECOLOR", "TWOCOLOR", "DUALMODE"];
const OTHER_TECHNOLOGY_TYPES = ["SEQUENCING", "GENELIST", "OTHER"];
const TECHNOLOGY_TYPES = ["MICROARRAY", "RNA_SEQ"] + MICROARRAY_TECHNOLOGY_TYPES + OTHER_TECHNOLOGY_TYPES;

export default {
  name: "TechnologyTypeSelector",
  props: {
    /**
     * Selected technology types.
     */
    value: Array,
    platforms: Array,
    disabled: Boolean
  },
  events: ["input"],
  data() {
    return {
      selectedValues: []
    };
  },
  computed: {
    technologyTypes() {
      let microarrayPlatforms = this.platforms.filter(p => MICROARRAY_TECHNOLOGY_TYPES.includes(p.technologyType));
      let rnaseqPlatforms = this.platforms.filter(p => p.technologyType === "SEQUENCING");
      return [
        {
          id: "RNASEQ",
          name: "RNA-Seq",
          numberOfExpressionExperiments: sumBy(rnaseqPlatforms, "numberOfExpressionExperiments")
        },
        {
          id: "MICROARRAY",
          name: "Microarray",
          children: microarrayPlatforms,
          numberOfExpressionExperiments: sumBy(microarrayPlatforms, "numberOfExpressionExperiments")
        }
      ];
    }
  },
  methods: {
    computeSelectedPlatforms(ids, st) {
      return this.platforms
        .filter(p => ids.has(p.id))
        .filter(p => !st.includes(p.technologyType)); // exclude platforms which are already selected via technology type
    },
    computeSelectedTechnologyTypes(sv) {
      return this.technologyTypes
        .filter(v => sv.has(v.id) || (v.children && v.children.every(c => sv.has(c.id))))
        .flatMap(v => {
          if (v.id === "MICROARRAY") {
            return MICROARRAY_TECHNOLOGY_TYPES;
          } else {
            return [v.id];
          }
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
      if (!isEqual(selectedPlatforms, oldSelectedPlatforms)) {
        this.$emit("input", selectedPlatforms);
      }
      if (!isEqual(selectedTechnologyTypes, oldSelectedTechnologyTypes)) {
        this.$emit("update:selectedTechnologyTypes", selectedTechnologyTypes);
      }
    }
  }
};
</script>