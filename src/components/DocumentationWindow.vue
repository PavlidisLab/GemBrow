<template>
    <v-dialog :value="value" @input="newVal => $emit('input', newVal)" width="800">
        <v-card>
            <v-card-title>
                GemBrow Documentation
                <v-spacer></v-spacer>
                <v-btn icon @click="$emit('input', false)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text>
                <p>
                    How on earth do these filters work?
                </p>
                <p>
                    What are these buttons for?
                </p>
                <p>
                    the limits to how many things are shown. Something like “Within each annotation category, items with small numbers of occurrences (i.e. less than ~4) may not be shown; use the ‘search’ functionality if something you seeking isn’t listed”
                </p>
                <p>
                    We might also need to explain where these annotations come from and that they have limitations like what I said about every dataset having some “biological sex” but not annotated. Something like “The categories and terms shown are derived from the concepts associated with datasets. Datasets are annotated to capture the most salient features of the experimental setting and design” (not sure the best way to say this without giving an example - but we want to keep it short!!)
                </p>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import { mapState } from "vuex";
import { baseUrl, marked } from "@/config/gemma";

export default {
  props: {
    value: Boolean
  },
  data() {
    return {
      baseUrl
    };
  },
  computed: mapState({
    root: state => state.api.root?.data || { externalDatabases: [] }
  }),
  methods: {
    m2h(m) {
      return marked.parseInline(m);
    }
  },
  created() {
    this.$store.dispatch("api/getRoot").catch(e => {
      console.error("Failed to retrieve the root endpoint: " + e.message + ".", e);
    });
  }
};
</script>