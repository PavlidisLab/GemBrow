<template>
  <v-treeview
          :items="treeItems"
          item-key="id"
          v-model="selectedTaxaIds"
          multiple
          selectable
          dense
          :disabled="disabled"
  >
  <template v-slot:label="{ item }">
    <span v-text="item.label" class="text-capitalize text-truncate"> </span>
  </template>
  <template v-slot:append="{ item }">
    <span v-if="item.type !== 'parent'"> {{ formatNumber(item.number) }} </span>
  </template>
  </v-treeview>
</template>

<script>
import { formatNumber } from "@/utils";

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
  treeItems() {
    const items = [
      {
        id: "taxon",
        label: "Taxa",
        type: "parent",
        children: []
      }
    ];

    for (const taxon of this.rankedTaxa) {
      const isSelected = this.selectedTaxa.some((t) => t.id === taxon.id);

      const taxonItem = {
        ...taxon,
        id: taxon.id,
        label: this.labelWithCommonName(taxon),
        type: "taxon",
        number: this.numberOfExperimentsLabel(taxon),
        selected: isSelected
      };

      items[0].children.push(taxonItem);
    }
    return items;
  },
  selectedTaxa() {
    if(!this.selectedTaxaIds) return [];
    return this.taxon.filter(taxon => this.selectedTaxaIds.includes(taxon.id));
  }
},
methods: {
  formatNumber,
  labelWithCommonName(item) {
        return `${item.scientificName} (${item.commonName})`;
    },
  numberOfExperimentsLabel(item) {
        return item.numberOfExpressionExperiments;
  }
},
watch: {
    selectedTaxa(newVal) {
        this.$emit("input", newVal);
      }
  }
};

</script>

<style>
button.v-treeview-node__toggle + button.v-treeview-node__checkbox {
display: none !important;
}

.v-treeview {
    max-width: 100%;
}

.v-treeview-node__children {
    max-height: 300px;
    overflow-y: auto;
}
</style>