<template>
    <v-select v-model="selectedPlatformIds" :items="selectablePlatforms"
              item-value="id" item-text="name" label="Platforms" clearable
              :disabled="disabled"
              :menu-props="menuProps"
              multiple
              @click:clear="selectedTechnologyType = null"
              ref="platformSelector"
              >
        <template v-slot:prepend-item>
            <v-list-item v-for="technologyType in selectableTechnologyTypes" 
                         :key="technologyType.id" 
                         @click="updateTechnologyType(technologyType.id)" 
                         dense>
                <v-list-item-content>
                    <v-list-item-title>
                        {{ technologyType.label }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                        Technology type with {{ getTechnologyTypeNumberOfExpressionExperiments(technologyType.id) }}
                        experiments
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
            <v-divider v-if="selectablePlatforms.length > 0"/>
        </template>
        <template v-slot:item="{item}">
            <v-list-item-content>
                <v-list-item-title class="text-truncate">
                    {{ item.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                    <div class="capitalize-first-letter">
                        {{ getTechnologyTypeLabel(item.technologyType) }} platform with
                        {{ item.numberOfExpressionExperiments }} experiments
                    </div>
                </v-list-item-subtitle>
            </v-list-item-content>
        </template>
        <template v-slot:selection="{ item, index }">
          <span v-if="selectedTechnologyType">
              <span v-if="index === 0">
              {{  getTechnologyTypeLabel(item.technologyType) }}
            </span>
          </span>
          <span v-else>
            {{ item.name }}, 
          </span>
        </template>
    </v-select>
</template>

<script>
import { sumBy, debounce } from "lodash";

export default {
  name: "PlatformSelector",
  props: {
    /**
     * Pre-selected platforms.
     */
    value: Array,
    /**
     * A list of available platforms.
     */
    platforms: Array,
    /**
     * A list of available technology types.
     */
    technologyTypes: Array,
    disabled: Boolean
  },
  data() {
    return {
      selectedTechnologyType: null,
      selectedPlatformIds: this.value && this.value.map(p => p.id),
      menuProps: {
        maxWidth: 430
      }
    };
  },
  emits: ["input", "update:selectedTechnologyType"],
  computed: {
    technologyTypeSelected() {
      return true;
    },
    selectablePlatforms() {
      return this.platforms;
    },
    selectableTechnologyTypes() {
      let mentioned = new Set(this.platforms.map(p => p.technologyType));
      let that = this;
      return this.technologyTypes.filter(t => mentioned.has(t.id)).sort(function(a, b) {
        return that.getTechnologyTypeNumberOfExpressionExperiments(b.id) - that.getTechnologyTypeNumberOfExpressionExperiments(a.id);
      });
    },
    selectedPlatforms() {
      return this.platforms.filter(p => this.selectedPlatformIds.includes(p.id) || this.selectedTechnologyType === p.technologyType);
    },
    /**
     * Indicate if the selection menu is active.
     */
    isPlatformSelectorMenuActive() {
      return this.$refs.platformSelector?.isMenuActive || false;
    }
  },
  methods: {
    updateTechnologyType(t) {
      this.selectedTechnologyType = t;
      this.selectedPlatformIds = this.platforms.filter(p => p.technologyType === t).map(p => p.id);
      this.$emit("update:selectedTechnologyType", t);
    },
    getTechnologyTypeNumberOfExpressionExperiments(t) {
      return sumBy(this.platforms.filter(p => p.technologyType === t), p => p.numberOfExpressionExperiments);
    },
    getTechnologyTypeLabel(t) {
      return this.technologyTypes.find(t2 => t2.id === t).label;
    },
    getTechnologyTypeColor(t) {
      return {
        "GENELIST": "red",
        "SEQUENCING": "purple",
        "ONECOLOR": "light-blue",
        "TWOCOLOR": "teal"
      }[t];
    }
  },
  mounted() {
    // the refs do not exist until the component is mounted, so we cannot use
    this.$watch('isPlatformSelectorMenuActive', function(newVal){
      if (!newVal) {
        console.log(this.selectedPlatforms);
        this.$emit("input", this.selectedPlatforms);
      }
    });
    // update selected platform if menu is not active (i.e. when clearing the selection)
    this.$watch('selectedPlatforms', function(newVal) {
      if (!this.isPlatformSelectorMenuActive) {
        this.$emit("input", newVal);
      }
    });
  }
};
</script>

<style scoped>
.capitalize-first-letter {
    text-transform: lowercase;
}

.capitalize-first-letter:first-letter {
    text-transform: uppercase;
}
</style>