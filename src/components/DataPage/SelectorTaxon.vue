<template>
  <span>
    <v-switch v-model="taxon_on" label="Taxon"/>
    <v-select
            v-show="taxon_on"
            :items="taxa"
            item-value="id"
            item-text="scientificName"
            v-model="taxon"
            :disabled="!taxon_on"
            single-line
    >
      <template slot="selection" slot-scope="data">
        <div class="input-group__selections__comma">
          {{ data.item.scientificName }}&nbsp;<span v-if="data.item.commonName"
        >({{ data.item.commonName }})</span
        >
        </div>
      </template>
      <template slot="item" slot-scope="data">
        {{ data.item.scientificName }}&nbsp;<span v-if="data.item.commonName"
      >({{ data.item.commonName }})</span
      >
      </template>
    </v-select>
  </span>
</template>

<script>
export default {
  name: "SelectorTaxon",
  props: {
    taxa: Array,
    storeName: String
  },
  mounted() {
    this.refreshTaxa();
  },
  methods: {
    refreshTaxa() {
      let self = this;
      this.$store.dispatch("api/gettaxa").then(function() {
        self.taxon = self.taxa[0].id;
      });
    }
  },
  computed: {
    taxon_on: {
      get() {
        return this.$store.state[this.storeName].taxon_on;
      },
      set(value) {
        // noinspection JSIgnoredPromiseFromCall
        this.$store.dispatch(this.storeName + "/setTaxon_on", value);
      }
    },
    taxon: {
      get() {
        return this.$store.state[this.storeName].taxon;
      },
      set(value) {
        // noinspection JSIgnoredPromiseFromCall
        this.$store.dispatch(this.storeName + "/setTaxon", value);
      }
    }
  }
};
</script>

<style scoped></style>
