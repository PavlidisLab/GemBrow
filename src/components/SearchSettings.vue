<template>
    <v-form class="search-settings"
    >
        <v-btn-toggle multiple
                      v-model="searchSettings.resultTypes"
                      @input="$emit('input')" v-show="false">
            <v-btn
                    v-for="m in supportedResultTypes"
                    :key="m.id"
                    :value="m.id"
            >
                {{ m.title }}
            </v-btn>
        </v-btn-toggle>
        <div class="d-flex justify-end">
            <v-btn v-if="showClearAllSelections"
                   @click="clearAllSelections"
                   right medium text color="primary"
                   class="mb-3">
                Clear All Selections
            </v-btn>
        </div>
        <v-text-field
                v-model="searchSettings.query"
                label="Search"
                prepend-inner-icon="mdi-magnify"
                outlined
                clearable
                hide-details
                class="mb-3"
        ></v-text-field>
        <TaxonSelector
                v-model="searchSettings.taxon"
                :taxon="taxon"
                :disabled="taxonDisabled"
                :loading="taxaLoading"
                class="mb-1"/>
        <TechnologyTypeSelector
                v-if="searchSettings.resultTypes.indexOf(platformResultType) === -1"
                v-model="searchSettings.platforms"
                :platforms="platforms"
                :selected-technology-types.sync="searchSettings.technologyTypes"
                :disabled="platformDisabled"
                :loading="platformLoading"
                class="mb-1"/>
        <v-range-slider
                v-model="searchSettings.quality"
                min="0" max="3"
                ticks="always"
                :tick-labels="['trash', 'low', 'mid', 'high']"
                label="Quality" title="Filter based on GEEQ scores or curation status"
                v-show="false"
                class="mb-1"/>
        <AnnotationSelector
                v-model="searchSettings.annotations"
                :annotations="annotations"
                :loading="annotationLoading"
                :disabled="annotationDisabled"
                :selectedCategories.sync="searchSettings.categories"/>
        <div :class="debug ? '' : 'd-lg-none'">
            <div style="margin-bottom: 59px;"></div>
            <div class="d-flex align-center"
                 style="position: fixed; left: 0; bottom: 0; background: white; height: 59px; width: 100%; border-top: thin solid rgba(0, 0, 0, 0.12); padding: 0 8px;"
            >
                <v-switch v-if="debug"
                          v-model="searchSettings.ignoreExcludedTerms"
                          label="Ignore Excluded Terms (dev only)"
                          hide-details
                          class="mt-0"/>
                <v-spacer/>
                <div class="d-lg-none">
                    <slot name="deactivator"/>
                </div>
            </div>
        </div>
    </v-form>
</template>

<script>
import TaxonSelector from "@/components/TaxonSelector";
import { ArrayDesignType, SearchSettings, SUPPORTED_RESULT_TYPES } from "@/lib/models";
import AnnotationSelector from "@/components/AnnotationSelector.vue";
import { mapState } from "vuex";
import TechnologyTypeSelector from "@/components/TechnologyTypeSelector.vue";

export default {
  components: { TechnologyTypeSelector, AnnotationSelector, TaxonSelector },
  props: {
    value: {
      type: SearchSettings,
      required: true
    },
    /**
     * A list of available platforms for the PlatformSelector.
     */
    platforms: Array,
    taxon: Array,
    annotations: Array,
    technologyTypes: Array,
    platformDisabled: Boolean,
    taxonDisabled: Boolean,
    annotationDisabled: Boolean,
    annotationLoading: Boolean,
    platformLoading: Boolean,
    taxaLoading: Boolean,
    totalNumberOfExpressionExperiments: Number
  },
  emits: ["input"],
  data() {
    return {
      searchSettings: this.value,
      platformResultType: ArrayDesignType,
      selectedTaxa: this.value ? [this.value] : []
    };
  },
  computed: {
    supportedResultTypes() {

      return SUPPORTED_RESULT_TYPES.sort((a, b) => a.order - b.order);
    },
    /**
     * Since individual search setting have their clear buttons, we only show the clear all if there is more than one.
     */
    showClearAllSelections() {
      return (this.searchSettings.annotations.length > 0)
        + (this.searchSettings.platforms.length > 0)
        + (this.searchSettings.taxon.length > 0)
        + (this.searchSettings.technologyTypes.length > 0)
        + (!!this.searchSettings.query) > 1;
    },
    ...mapState({
      debug: state => state.debug
    })
  },
  methods: {
    clearAllSelections() {
      this.searchSettings.annotations = [];
      this.searchSettings.platforms = [];
      this.searchSettings.taxon = []; 
      this.searchSettings.technologyTypes = [];
      this.searchSettings.query = undefined;
    }
  },
  watch: {
    searchSettings: {
      handler: function(newValue) {
        this.$emit("input", newValue);
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.search-settings >>> .v-treeview-node__children {
    max-height: 200px;
    overflow-y: auto;
}
</style>