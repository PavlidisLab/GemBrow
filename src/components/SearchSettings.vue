<template>
    <v-navigation-drawer permanent width="100%">
        <v-form
        >
            <v-list-item v-show="false">
                <v-list-item-content>
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
                </v-list-item-content>
            </v-list-item>
            <v-list-item>
                <v-list-item-content>
                    <v-text-field
                            v-model="searchSettings.query"
                            label="Search"
                            prepend-inner-icon="mdi-magnify"
                            outlined
                            :disabled="disabled"
                    ></v-text-field>
                </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="searchSettings.resultTypes.indexOf(platformResultType) === -1">
                <PlatformSelector
                        v-model="searchSettings.platform"
                        :taxon="searchSettings.taxon"
                        :platforms="platforms"
                        :disabled="disabled"/>
            </v-list-item>
            <v-list-item>
                <TaxonSelector
                        v-model="searchSettings.taxon"
                        :taxa="taxa"
                        :disabled="disabled"/>
            </v-list-item>
            <v-list-item>
                <TechnologyTypeSelector
                        v-model="searchSettings.technologyTypes"
                        :technology-types="technologyTypes"
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
                        :disabled="disabled"/>
            </v-list-item>
        </v-form>
    </v-navigation-drawer>
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
import TechnologyTypeSelector from "@/components/TechnologyTypeSelector.vue";
import AnnotationSelector from "@/components/AnnotationSelector.vue";

export default {
  components: { AnnotationSelector, TechnologyTypeSelector, TaxonSelector, PlatformSelector },
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
    disabled: Boolean
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