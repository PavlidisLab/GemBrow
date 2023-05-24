<template>
    <div class="py-3">
        <h3>{{ dataset.name }}</h3>
        <span v-html="this.description"></span>
    </div>
</template>

<script>
import { highlight } from "@/search-utils";
import { marked } from "@/config/gemma";

export default {
  name: "DatasetPreview",
  props: {
    dataset: Object
  },
  computed: {
    description() {
      if (this.dataset.searchResult !== undefined && this.dataset.searchResult.highlights !== null && "description" in this.dataset.searchResult.highlights) {
        return marked.parseInline(highlight(this.dataset.description, this.dataset.searchResult.highlights.description));
      }
      return marked.parseInline(this.dataset.description);
    }
  }
};
</script>