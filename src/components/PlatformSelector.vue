<template>
    <v-select v-model="selectedPlatformIds" :items="selectablePlatforms"
              item-value="id" item-text="name" label="Platforms" clearable
              :disabled="disabled"
              :menu-props="menuProps"
              multiple
              ref="platformSelector"
              >
        <template v-slot:prepend-item>
            <v-list-item v-for="technologyType in selectableTechnologyTypes" :key="technologyType.id" dense>
                <v-list-item-content>
                    <v-list-item-title>
                        {{ technologyType.label }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                        Technology type with {{ getTechnologyTypeNumberOfExpressionExperiments(technologyType.id) }}
                        experiments
                    </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                    <v-btn text style="font-size: 10px" @click="selectedPlatformIds = selectablePlatforms.filter(p => p.technologyType === technologyType.id).map(p => p.id)">
                        Select all
                    </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                    <v-checkbox
                            v-model="selectedTechnologyTypes"
                            :value="technologyType.id">
                    </v-checkbox>
                </v-list-item-action>
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
      selectedPlatforms: this.value,
      selectedTechnologyTypes: [],
      menuProps: {
        maxWidth: 430
      }
    };
  },
  emits: ["input"],
  computed: {
    selectablePlatforms() {
      let stt = this.selectedTechnologyTypes;
      return this.platforms.filter(p => stt.length === 0 || stt.includes(p.technologyType));
    },
    selectableTechnologyTypes() {
      let mentioned = new Set(this.platforms.map(p => p.technologyType));
      let that = this;
      return this.technologyTypes.filter(t => mentioned.has(t.id)).sort(function(a, b) {
        return that.getTechnologyTypeNumberOfExpressionExperiments(b.id) - that.getTechnologyTypeNumberOfExpressionExperiments(a.id);
      });
    },
    selectedPlatformIds: {
      get: function() {
        return this.selectedPlatforms.map(p => p.id);
      },
      set: function(newVal) {
        if (newVal) {
          this.selectedPlatforms = this.platforms.filter(p => newVal.includes(p.id));
        } else {
          this.selectedPlatforms = [];
        }
      }
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
    // the refs do not exist until the component is mounted, so we cannot use
    this.$watch('isPlatformSelectorMenuActive', function(newVal){
      if (!newVal) {
        console.log(this.selectedPlatforms);
        this.$emit("input", this.selectedPlatforms);
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