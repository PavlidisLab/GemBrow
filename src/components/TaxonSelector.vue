<template>
  <v-select
          :items="rankedTaxa"
          item-value="id"
          item-text="labelWithCommonName"
          v-model="selectedTaxaIds"
          multiple
          clearable
          label="Taxa"
          :disabled="disabled"
          v-if="rankedTaxa.length > 0"
          ref="taxonSelector"
  >
      <!-- slot for the selected element -->
      <template v-slot:selection="data">
          <div class="input-group__selections__comma">
              {{ data.item.scientificName }}&nbsp;<span v-if="data.item.commonName">({{
                  data.item.commonName
              }})</span>
          </div>
      </template>
      <!-- slot for the dropdown -->
      <template v-slot:item="{ item }">
        <v-checkbox :value="item.id" v-model="selectedTaxaIds" multiple> 
          <template v-slot:label>
            <div v-html="labelWithCommonName(item)"></div>
          </template>
        </v-checkbox>
      </template>
  </v-select>
</template>

<script>
export default {
name: "TaxonSelector",
props: {
  value: Array,
  /**
   * A list of available taxa.
   */
  taxon: Array,
  disabled: Boolean
},
emits: ["input"],
data() {
  return {
    /**
     * Holds the currently selected taxon.
     * This holds the initial taxon value, which must be one of the provided taxa.
     */
     selectedTaxaIds: this.value && this.value.map(t => t.id) || []

  };
},
computed: {
  rankedTaxa() {
    let sortedTaxa = [...this.taxon];
    sortedTaxa.sort(function(a, b) {
      return b.numberOfExpressionExperiments - a.numberOfExpressionExperiments;
    });
    return sortedTaxa;
  },
  selectedTaxa() {
    if (!this.selectedTaxaIds) return []; // Handle null or undefined case
    return this.taxon.filter(t => this.selectedTaxaIds.includes(t.id));
  },
  isTaxonSelectorMenuActive() {
    return this.$refs.taxonSelector?.isMenuActive || false;
  }
},
methods: {
  labelWithCommonName(item) {
        return `${item.scientificName} (${item.commonName})
          <br>
          <span style="font-size: 12px">${item.numberOfExpressionExperiments} Experiments</span>
        `;
    }
},
mounted() {
  this.$watch('isTaxonSelectorMenuActive', function(newVal){
    if(!newVal) {
      this.$emit("input", this.selectedTaxa);
    }
  });
  this.$watch('selectedTaxa', function(newVal) {
    if(!this.isTaxonSelectorMenuActive) {
      this.$emit("input", newVal);
    }
  });
}
};

</script>

<style scoped></style>