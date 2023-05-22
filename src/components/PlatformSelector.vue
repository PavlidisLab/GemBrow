<template>
    <v-select v-model="selectedPlatformId" :items="selectablePlatforms"
              item-value="id" item-text="name" label="Platform" clearable
              :disabled="disabled"
              :menu-props="menuProps">
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
                    <v-checkbox
                            v-model="selectedTechnologyTypes"
                            :value="technologyType.id">
                    </v-checkbox>
                </v-list-item-action>
            </v-list-item>
            <v-divider/>
        </template>
        <template v-slot:item="{item}">
            <v-list-item-content>
                <v-list-item-title class="text-truncate">
                    {{ item.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                    <span class="technology-type">{{ getTechnologyTypeLabel(item.technologyType) }}</span>
                    platform with
                    {{ item.numberOfExpressionExperiments }} experiments
                </v-list-item-subtitle>
            </v-list-item-content>
        </template>
    </v-select>
</template>

<script>
import { sumBy } from "lodash";

export default {
  name: "PlatformSelector",
  props: {
    /**
     * Pre-selected platform.
     */
    value: Object,
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
      selectedPlatform: this.value,
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
    selectedPlatformId: {
      get: function() {
        return this.selectedPlatform && this.selectedPlatform.id;
      },
      set: function(newVal) {
        this.selectedPlatform = newVal && this.platforms.find(p => p.id === newVal);
      }
    }
  },
  methods: {
    getTechnologyTypeNumberOfExpressionExperiments(t) {
      return sumBy(this.platforms.filter(p => p.technologyType === t), p => p.numberOfExpressionExperiments);
    },
    getTechnologyTypeLabel(t) {
      return this.technologyTypes.find(t2 => t2.id == t).label;
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
  watch: {
    selectedPlatform(val) {
      this.$emit("input", val);
    }
  }
};
</script>

<style scoped>
.technology-type {
    display: inline-block;
    text-transform: lowercase;
}

.technology-type:first-letter {
    text-transform: uppercase;
}
</style>