<template>
    <div>
        <div class="d-flex align-baseline">
            <div class="text--secondary">Technology Types (preview)</div>
            <v-spacer></v-spacer>
            <v-btn v-if="selectedValues.length > 0" @click="selectedValues = []" small text color="primary">
                Clear Selection
            </v-btn>
        </div>
        <v-treeview v-model="selectedValues"
                    :items="technologyTypes"
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

import { sumBy } from "lodash";

const MICROARRAY_TECHNOLOGY_TYPES = ["ONECOLOR", "TWOCOLOR", "DUALMODE"];
export default {
  name: "TechnologyTypeSelector",
  props: {
    value: Array,
    platforms: Array
  },
  events: ["input"],
  data() {
    return {
      selectedValues: []
    };
  },
  computed: {
    technologyTypes() {
      return [
        {
          id: "microarray",
          name: "Microarray",
          children: this.platforms.filter(p => MICROARRAY_TECHNOLOGY_TYPES.includes(p.technologyType))
        },
        {
          id: "rnaseq",
          name: "RNA-Seq",
          numberOfExpressionExperiments: sumBy(this.platforms.filter(p => p.technologyType === "GENELIST"), "numberOfExpressionExperiments")
        }
      ];
    }
  },
  watch: {
    selectedValues: function(newVal) {
      this.$emit("input", newVal);
    }
  }
};
</script>