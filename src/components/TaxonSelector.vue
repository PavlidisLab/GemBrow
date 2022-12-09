<template>
    <v-select
            :items="taxa"
            item-value="id"
            item-text="scientificName"
            v-model="selectedTaxonId"
            clearable
            label="Taxon"
            :disabled="disabled"
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
        <template v-slot="data">
            {{ data.item.scientificName }}&nbsp;<span v-if="data.item.commonName">({{ data.item.commonName }})</span>
        </template>
    </v-select>
</template>

<script>
export default {
  name: "TaxonSelector",
  props: {
    value: Object,
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
      selectedTaxon: this.value
    };
  },
  computed: {
    selectedTaxonId: {
      get: function() {
        return this.selectedTaxon && this.selectedTaxon.id;
      },
      set: function(newVal) {
        this.selectedTaxon = newVal && this.taxa.find(t => t.id === newVal);
      }
    }
  },
  watch: {
    selectedTaxon(value) {
      this.$emit("input", value);
    }
  }
};
</script>

<style scoped></style>
