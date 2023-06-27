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
        <v-text-field
                v-model="searchSettings.query"
                label="Search"
                prepend-inner-icon="mdi-magnify"
                outlined
                clearable
                hide-details
        ></v-text-field>
        <TaxonSelector
                v-model="searchSettings.taxon"
                :taxa="taxa"
                :disabled="taxonDisabled"/>
        <PlatformSelector
                v-if="searchSettings.resultTypes.indexOf(platformResultType) === -1"
                v-model="searchSettings.platform"
                :platforms="platforms"
                :technology-types="technologyTypes"
                :disabled="platformDisabled"/>
        <v-range-slider
                v-model="searchSettings.quality"
                min="0" max="3"
                ticks="always"
                :tick-labels="['trash', 'low', 'mid', 'high']"
                label="Quality" title="Filter based on GEEQ scores or curation status"
                v-show="false"/>
        <p class="text--secondary">
            Annotations
        </p>
        <AnnotationSelector
                v-model="searchSettings.annotations"
                :annotations="annotations"
                :disabled="annotationDisabled"
                :total-number-of-expression-experiments="totalNumberOfExpressionExperiments"
                :selectedCategories.sync="searchSettings.categories" style="margin-bottom: 48px;"
                :debug="debug"/>
        <v-checkbox v-if="debug" v-model="searchSettings.includeBlacklistedTerms"
                    label="Include Blacklisted Terms (dev only)"
                    style="position: fixed; bottom: 0; background: white; width: 100%;"
                    hide-details class="py-3"/>
    </v-form>
</template>

<script>
import TaxonSelector from "@/components/TaxonSelector";
import PlatformSelector from "@/components/PlatformSelector.vue";
import { ArrayDesignType, SearchSettings, SUPPORTED_RESULT_TYPES } from "@/models";
import AnnotationSelector from "@/components/AnnotationSelector.vue";

export default {
  components: { AnnotationSelector, TaxonSelector, PlatformSelector },
  props: {
    value: {
      type: SearchSettings,
      required: true
    },
    /**
     * A list of available platforms for the PlatformSelector.
     */
    platforms: Array,
    taxa: Array,
    annotations: Array,
    technologyTypes: Array,
    platformDisabled: Boolean,
    taxonDisabled: Boolean,
    annotationDisabled: Boolean,
    totalNumberOfExpressionExperiments: Number,
    debug: Boolean
  },
  emits: ["input"],
  data() {
    return {
      searchSettings: this.value,
      platformResultType: ArrayDesignType
    };
  },
  computed: {
    supportedResultTypes() {
      return SUPPORTED_RESULT_TYPES.sort((a, b) => a.order - b.order);
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

</style>