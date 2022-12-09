<template>
    <v-select v-model="selectedTechnologyTypes" :items="technologyTypes" :disabled="disabled" item-value="id"
              item-text="label" multiple
              label="Technology Type">

    </v-select>
</template>

<script>

export default {
  name: "TechnologyTypeSelector",
  props: {
    value: Array,
    /**
     * Available technology types.
     */
    technologyTypes: Array,
    disabled: Boolean
  },
  data() {
    return {
      selectedTechnologyTypes: this.value
    };
  },
  watch: {
    selectedTechnologyTypes(val) {
      this.$emit("input", val);
    }
  }
};
</script>

<style scoped>

</style>