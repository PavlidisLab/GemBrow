<template>
    <v-dialog :value="value" @input="newVal => $emit('input', newVal)" width="800">
        <v-card>
            <v-card-title>About Gemma</v-card-title>
            <v-card-text>
                <p>
                    Gemma is a web site, database and a set of tools for the meta-analysis, re-use and sharing of
                    genomics data, currently primarily targeted at the analysis of gene expression profiles. Gemma
                    contains data from thousands of public studies, referencing thousands of published papers. Users can
                    search, access and visualize coexpression and differential expression results. For more information,
                    see the
                    <a href="https://pavlidislab.github.io/Gemma/" target="_blank">help and documentation <v-icon x-small>mdi-open-in-new</v-icon></a>.
                </p>
                <p>
                    Gemma was developed by the Pavlidis group at UBC (<a href="https://pavlidislab.github.io/Gemma/#credits" target="_blank">credits&nbsp;<v-icon x-small>mdi-open-in-new</v-icon></a>).
                </p>
                <p>
                    To cite Gemma, please use:<br>
                    Lim N., et al., Curation of over 10,000 transcriptomic studies to enable data reuse.
                    <em>Database</em>, 2021. <a href="https://doi.org/10.1093/database/baab006" target="_blank">link&nbsp;<v-icon x-small>mdi-open-in-new</v-icon></a>
                </p>
                <p>Gemma's expression platform and gene annotations are powered by:</p>
                <template v-for="ed in root.externalDatabases">
                    <h4 :key="ed.id + '_dd'" class="text-capitalize">{{ ed.name }}</h4>
                    <p :key="ed.id + '_dt'">
                        {{ ed.description }}
                        <a v-if="ed.uri" :href="ed.uri" target="_blank" rel="noreferrer noopener">link <v-icon x-small>mdi-open-in-new</v-icon></a><br>
                        <span v-if="ed.releaseVersion">Release used: {{ ed.releaseVersion }}.<br></span>
                        <span v-if="ed.lastUpdated">Last updated on {{ new Date(ed.lastUpdated).toLocaleDateString() }}.<br></span>
                        <template>
                            <span v-for="rd in ed.externalDatabases" :key="rd.id">
                                <span class="text-capitalize">{{ rd.name }}</span> <a v-if="rd.releaseUrl" :href="rd.releaseUrl" target="_blank" rel="noreferrer noopener">{{ rd.releaseVersion}} <v-icon x-small>mdi-open-in-new</v-icon></a>
                                last updated on {{ new Date(rd.lastUpdated).toLocaleDateString() }}.
                                <a v-if="rd.uri" :href="rd.uri" target="_blank" rel="noreferrer noopener">link <v-icon x-small>mdi-open-in-new</v-icon></a>
                                <br>
                            </span>
                        </template>
                    </p>
                </template>
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
    root: state => state.api.root.data
  }),
  methods: {
    m2h(m) {
      return marked.parseInline(m);
    }
  },
  created() {
    this.$store.dispatch("api/getRoot");
  }
};
</script>