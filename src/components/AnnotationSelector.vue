<template>
    <v-treeview v-model="selectedAnnotations" :items="annotations" :disabled="disabled" item-key="id" selectable dense>
        <template v-slot:label="{item}">
            <i v-if="item.isCategory && isUncategorized(item)">Uncategorized</i>
            <span v-else v-text="getTitle(item)"/>
            <br>
            <small v-text="getUri(item)"/>
        </template>
        <template v-slot:append="{item}">
            <span>{{ item.numberOfExpressionExperiments }}</span>
        </template>
    </v-treeview>
</template>

<script>
export default {
  name: "AnnotationSelector",
  props: {
    /**
     * Pre-selected annotations.
     */
    value: Array,
    annotations: Array,
    disabled: Boolean
  },
  data() {
    return {
      selectedAnnotations: this.value
    };
  },
  emits: ["input"],
  methods: {
    isUncategorized(item) {
      return !item.className && !item.classUri;
    },
    getTitle(item) {
      // TODO: handle
      return item.isCategory ? (item.className || item.classUri) : (item.termName || item.termUri);
    },
    getUri(item) {
      return (item.isCategory ? item.classUri : item.termUri);
    }
  },
  watch: {
    selectedAnnotations(val) {
      this.$emit("input", val);
    }
  }
};
</script>

<style>

.v-treeview-node__label {
    max-width: 240px;
}

</style>