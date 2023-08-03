<template>
    <v-treeview
            :items="treeItems"
            item-key="id"
            v-model="selectedTaxaIds"
            selectable
            dense
            :disabled="disabled"
            class="hide-root-checkboxes"
    >
        <template v-slot:label="{ item }">
            <span v-text="item.label" class="text-truncate"> </span>
        </template>
        <template v-slot:append="{ item }">
            <span v-if="item.type !== 'parent'"> {{ formatNumber(item.number) }} </span>
            <span v-if="item.type === 'parent' && selectedTaxaIds.length > 0">
            <v-btn @click="clearSelections" small text color="primary" :disabled="disabled">
          Clear Selection
              </v-btn>
      </span>
        </template>
    </v-treeview>
</template>

<script>
import { formatNumber } from "@/utils";

export default {
  name: "TaxonSelector",
  props: {
    /**
     * A list of available taxa.
     */
    value: Array,
    taxon: Array,
    disabled: Boolean
  },
  emits: ["input"],
  data() {
    return {
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
      if (!this.selectedTaxaIds) return [];
      return this.taxon.filter(taxon => this.selectedTaxaIds.includes(taxon.id));
    }
  },
  methods: {
    formatNumber,
    labelWithCommonName(item) {
      return `${item.scientificName} (${item.commonName.charAt(0).toUpperCase() + item.commonName.slice(1)})`;
    },
    numberOfExperimentsLabel(item) {
      return item.numberOfExpressionExperiments;
    },
    clearSelections() {
      this.selectedTaxaIds = [];
    }
  },
  watch: {
    selectedTaxa(newVal) {
      this.$emit("input", newVal);
    }
  }
};

</script>

<style scoped>
.hide-root-checkboxes >>> .v-treeview-node__toggle + .v-treeview-node__checkbox {
display: none !important;
}

.hide-root-checkboxes >>> .v-treeview {
    max-width: 100%;
}

.hide-root-checkboxes >>> .v-treeview-node__children {
    max-height: 300px;
    overflow-y: auto;
}

</style>