<template>
    <v-select v-model="selectedPlatformId" :items="platforms"
              item-value="id" item-text="name" label="Platform" clearable
              :disabled="disabled">
    </v-select>
</template>

<script>
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
     * Taxon that restrict which platforms are rendered.
     */
    taxon: Object,
    disabled: Boolean
  },
  data() {
    return { selectedPlatform: this.value };
  },
  emits: ["input"],
  computed: {
    selectedPlatformId: {
      get: function() {
        return this.selectedPlatform && this.selectedPlatform.id;
      },
      set: function(newVal) {
        this.selectedPlatform = newVal && this.platforms.find(p => p.id === newVal);
        this.updateAvailablePlatforms();
      }
    }
  },
  watch: {
    selectedPlatform(val) {
      this.$emit("input", val);
    }
  }
}
;
</script>