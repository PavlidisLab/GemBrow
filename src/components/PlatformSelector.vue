<template>
    <v-select v-model="selectedPlatformId" :items="selectablePlatforms"
              item-value="id" item-text="name" label="Platform" clearable
              :disabled="disabled">
        <template v-slot:prepend-item>
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title>
                        Technology types:
                        <v-checkbox v-for="technologyType in selectableTechnologyTypes"
                                    :key="technologyType.id"
                                    v-model="selectedTechnologyTypes"
                                    :value="technologyType.id">
                            <template v-slot:label>
                                {{ technologyType.label }}<br>
                            </template>
                            <template v-slot:append>
                                {{ getTechnologyTypeNumberOfExpressionExperiments(technologyType.id) }}
                            </template>
                        </v-checkbox>
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-divider/>
        </template>
        <template v-slot:item="{item}">
            {{ item.name }}
            <v-chip :color="getTechnologyTypeColor(item.technologyType)">{{
                    getTechnologyTypeLabel(item.technologyType)
                }}
            </v-chip>
            {{ item.numberOfExpressionExperiments }}
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
      selectedTechnologyTypes: []
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

<style>
.v-menu__content {
    max-width: 240px;
}
</style>