<template>
    <v-select v-model="selectedPlatformIds" :items="selectablePlatforms"
              item-value="id" item-text="name" label="Platforms" clearable
              :disabled="disabled"
              :menu-props="menuProps"
              multiple
              @change="selectedTechnologyType = null"
              ref="platformSelector"
              no-data-text="No platforms available">
        >
        <template v-slot:prepend-item>
            <v-list-item v-for="technologyType in selectableTechnologyTypes"
                         :key="technologyType.id"
                         @click="selectedTechnologyType = selectedTechnologyType === technologyType.id ? null : technologyType.id"
                         dense
                         :class="selectedTechnologyType === technologyType.id ? 'v-list-item--active primary--text' : ''">
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
            <v-divider v-if="selectableTechnologyTypes.length > 0 && selectablePlatforms.length > 0"/>
        </template>
        <template v-slot:item="{item, on, attrs}">
            <v-list-item v-on="on" v-bind="attrs" :key="item.id">
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
            </v-list-item>
        </template>
        <template v-slot:selection="{ item, index }">
            <template v-if="selectedTechnologyType">
                <!-- only render the technology type label for the first selected platform -->
                <template v-if="index === 0">{{ getTechnologyTypeLabel(item.technologyType) }}</template>
            </template>
            <template v-else>
                {{ item.name + (index < selectedPlatformIds.length - 1 ? "," : "") }}
            </template>
        </template>
    </v-select>
</template>

<script>
import { sumBy } from "lodash";

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
        maxWidth: 430,
        closeOnContentClick: true
      }
    };
  },
  emits: ["input", "update:selectedTechnologyType"],
  computed: {
    selectablePlatforms() {
      return [...this.platforms]
        .sort((a, b) => {
          if (this.selectedPlatformIds.includes(a.id)) {
            if (!this.selectedPlatformIds.includes(b.id)) {
              return -1;
            }
          } else if (this.selectedPlatformIds.includes(b.id)) {
            return 1;
          }
          return b.numberOfExpressionExperiments - a.numberOfExpressionExperiments;
        });
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
    // the refs do not exist until the component is mounted, so we cannot use the watch section below
    this.$watch("isPlatformSelectorMenuActive", function(newVal) {
      if (!newVal) {
        this.$emit("input", this.selectedPlatforms);
      }
    });
  },
  watch: {
    /**
     * Ensure that all the platforms of a given technology type are selected.
     */
    platforms(newVal) {
      if (this.selectedTechnologyType) {
        let s = this.selectedPlatformIds;
        this.selectedPlatformIds = newVal
          .filter(p => p.technologyType === this.selectedTechnologyType || s.includes(p.id))
          .map(p => p.id);
      }
    },
    /**
     * Update selected platform if menu is not active (i.e. when clearing the selection)
     */
    selectedPlatforms(newVal) {
      if (!this.isPlatformSelectorMenuActive) {
        this.$emit("input", newVal);
      }
    },
    /**
     * When a technology type is selected, select all the platforms of that type.
     */
    selectedTechnologyType(newVal) {
      this.selectedPlatformIds = this.platforms.filter(p => p.technologyType === newVal).map(p => p.id);
      this.$emit("update:selectedTechnologyType", newVal);
    }
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