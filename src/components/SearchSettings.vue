<template>
    <v-form class="search-settings"
    >
        <v-list-item v-show="false">
            <v-btn-toggle multiple
                          v-model="searchSettings.resultTypes"
                          @input="$emit('input')">
                <v-btn
                        v-for="m in supportedResultTypes"
                        :key="m.id"
                        :value="m.id"
                >
                    {{ m.title }}
                </v-btn>
            </v-btn-toggle>
        </v-list-item>
        <v-list-item>
            <v-text-field
                    v-model="searchSettings.query"
                    label="Search"
                    prepend-inner-icon="mdi-magnify"
                    outlined
                    :disabled="disabled"
            ></v-text-field>
        </v-list-item>
        <v-divider/>
        <v-list-item>
            <PlatformSelector
                    v-if="searchSettings.resultTypes.indexOf(platformResultType) === -1"
                    v-model="searchSettings.platform"
                    :platforms="platforms"
                    :technology-types="technologyTypes"
                    :disabled="disabled"/>
        </v-list-item>
        <v-list-item>
            <TaxonSelector
                    v-model="searchSettings.taxon"
                    :taxa="taxa"
                    :disabled="disabled"/>
        </v-list-item>
        <v-list-item v-show="false">
            <v-range-slider
                    v-model="searchSettings.quality"
                    min="0" max="3"
                    ticks="always"
                    :tick-labels="['trash', 'low', 'mid', 'high']"
                    label="Quality" title="Filter based on GEEQ scores or curation status"
                    :disabled="disabled"/>
        </v-list-item>
        <v-list-item>
            <AnnotationSelector
                    v-model="searchSettings.annotations"
                    :annotations="annotations"
                    :disabled="disabled"
                    :total-number-of-expression-experiments="totalNumberOfExpressionExperiments"
                    :selectedCategories.sync="searchSettings.categories"/>
        </v-list-item>
    </v-form>
</template>

<script>
import TaxonSelector from "@/components/TaxonSelector";
import PlatformSelector from "@/components/PlatformSelector.vue";
import {
  ArrayDesignType,
  ExpressionExperimentType,
  SearchSettings,
  SUPPORTED_RESULT_TYPES
} from "@/models";
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
    disabled: Boolean,
    totalNumberOfExpressionExperiments: Number
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