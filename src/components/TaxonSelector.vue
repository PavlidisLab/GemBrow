<template>
  <v-select
          :items="rankedTaxa"
          item-value="id"
          item-text="scientificName"
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
      <template v-slot:item="data">
          <v-list-item-content>
              <v-list-item-title>{{ data.item.scientificName }}&nbsp;<span
                      v-if="data.item.commonName">({{ data.item.commonName }})</span></v-list-item-title>
              <v-list-item-subtitle>{{ data.item.numberOfExpressionExperiments }} experiments</v-list-item-subtitle>
          </v-list-item-content>
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
  taxa: Array,
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
    let sortedTaxa = [...this.taxa];
    sortedTaxa.sort(function(a, b) {
      return b.numberOfExpressionExperiments - a.numberOfExpressionExperiments;
    });
    return sortedTaxa;
  },
  selectedTaxa() {
    if (!this.selectedTaxaIds) return []; // Handle null or undefined case
    return this.taxa.filter(t => this.selectedTaxaIds.includes(t.id));
  },
  isTaxonSelectorMenuActive() {
    return this.$refs.taxonSelector?.isMenuActive || false;
  }  
},
mounted() {
  this.$watch('isTaxonSelectorMenuActive', function(newVal){
    if(!newVal) {
      console.log(this.selectedTaxa);
      this.$emit("input", this.selectedTaxa)
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