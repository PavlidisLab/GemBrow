<template>
    <div>
        <div class="d-flex align-baseline">
            <div class="text--secondary">
                Taxa
            </div>
            <v-spacer></v-spacer>
            <v-btn v-if="selectedTaxaIds.length > 0" @click="clearSelections" small text color="primary"
                   :disabled="disabled">
                Clear Selection
            </v-btn>
        </div>
        <v-progress-linear :active="loading" indeterminate/>
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
                <div class="text-right">{{ formatNumber(item.number) }}</div>
            </template>
        </v-treeview>
        <p v-show="treeItems.length === 0 && !loading">
            No taxa available
        </p>
    </div>
</template>

<script>
import { formatNumber } from "@/lib/utils";
import { isEqual, debounce } from "lodash";

export default {
  name: "TaxonSelector",
  props: {
    /**
     * A list of available taxa.
     */
    value: Array,
    taxon: Array,
    disabled: Boolean,
    loading: Boolean
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
        const taxonItem = {
          ...taxon,
          id: taxon.id,
          label: this.labelWithCommonName(taxon),
          type: "taxon",
          number: this.numberOfExperimentsLabel(taxon),
          selected: this.selectedTaxaIds.includes(taxon.id)
        };
        items[0].children.push(taxonItem);
      }
      return items[0].children;
    },
    selectedTaxa() {
      return this.taxon.filter(taxon => this.selectedTaxaIds.includes(taxon.id));
    }
  },
  methods: {
    formatNumber,
    labelWithCommonName(item) {
      return `${item.scientificName} (${item.commonName?.charAt(0).toUpperCase() + item.commonName?.slice(1)})`;
    },
    numberOfExperimentsLabel(item) {
      return item.numberOfExpressionExperiments;
    },
    clearSelections() {
      this.selectedTaxaIds = [];
    },
    dispatchValues: debounce(function(newVal){
      this.$emit("input", newVal);
    },1000)
  },
  watch: {
    value(newVal) {
      this.selectedTaxaIds = newVal && newVal.map(t => t.id) || [];
    },
    selectedTaxa(newVal, oldVal) {
      if (!isEqual(newVal.map(t => t.id), oldVal.map(t => t.id))) {
        this.dispatchValues(newVal);
      }
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