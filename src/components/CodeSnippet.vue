<template>
    <v-tabs v-model="selectedTab" grow @change="emitResize()">
        <v-tab v-for="tab in snippetTabs" :key="tab.label" :label="tab.label" @click.stop=""> {{ tab.label }}
        </v-tab>
        <v-tab-item v-for="(tab) in snippetTabs" :key="tab.label" @click.stop="">
            <v-alert v-if="compressedUrl.length > MAX_URL_LENGTH" type="warning"
                     class="mb-0 rounded-0">
                The URL for the API call exceeds {{ MAX_URL_LENGTH }} characters it might not work as intended!
            </v-alert>
            <v-card flat max-width="650px" class="scroll">
                <v-card-subtitle><span v-html="renderMarkdown(tab.instructions)"/></v-card-subtitle>
                <v-card-text>
                    <highlightjs :language="tab.language" :code="tab.content" class="mb-3"/>
                    <div v-if="tab.postInstructions" v-html="renderMarkdown(tab.postInstructions)"/>
                </v-card-text>
                <v-card-actions v-show="browsingOptions.query !== undefined || browsingOptions.filter !== ''">
                    <v-btn @click="copy(tab.content)">
                        <v-icon>mdi-clipboard-outline</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-tab-item>
    </v-tabs>
</template>

<script>

import { compressFilter, formatNumber } from "@/lib/utils";
import { debounce } from "lodash";
import { baseUrl, marked } from "@/config/gemma";

/**
 * Maximum URL length.
 * @type {number}
 */
const MAX_URL_LENGTH = 2000;

/**
 * Maximum of datasets that can be retrieved in a page.
 * @type {number}
 */
const MAX_DATASETS = 100;

export default {
  name: "CodeSnippet",
  props: {
    browsingOptions: Object,
    searchSettings: Object,
    totalNumberOfExpressionExperiments: Number
  },
  data() {
    return {
      MAX_URL_LENGTH,
      selectedTab: 0,
      compressedFilter: ""
    };
  },
  computed: {
    uncompressedUrl() {
      const params = new URLSearchParams();
      if (this.browsingOptions.query !== undefined) {
        params.append("query", this.browsingOptions.query);
      }
      if (this.browsingOptions.filter?.map(subClauses => subClauses.join(" or "))?.join(" and ").length > 0) {
        params.append("filter", this.browsingOptions.filter?.map(subClauses => subClauses.join(" or "))?.join(" and "));
      }
      if (this.browsingOptions.sort !== undefined) {
        params.append("sort", this.browsingOptions.sort);
      }
      params.append("offset", "0");
      params.append("limit", MAX_DATASETS.toString());
      return baseUrl + "/rest/v2/datasets?" + params.toString();
    },
    compressedUrl() {
      const params = new URLSearchParams();
      if (this.browsingOptions.query !== undefined) {
        params.append("query", this.browsingOptions.query);
      }
      if (this.compressedFilter.length > 0) {
        params.append("filter", this.compressedFilter);
      }
      if (this.browsingOptions.sort !== undefined) {
        params.append("sort", this.browsingOptions.sort);
      }
      params.append("offset", "0");
      params.append("limit", MAX_DATASETS.toString());
      return baseUrl + "/rest/v2/datasets?" + params.toString();
    },
    snippetTabs() {
      const tabs = [
        {
          label: "gemmapy",
          language: "python",
          instructions: "Install the [gemmapy](https://pypi.org/project/gemmapy) package with pip and run the following code in a Python console:"
        },
        {
          label: "gemma.R",
          language: "r",
          instructions: `Install the [gemma.R](https://bioconductor.org/packages/release/bioc/html/gemma.R.html) package from GitHub and run the following code in an R console:`
        },
        {
          label: "curl",
          language: "bash",
          instructions: `Run the following [curl](https://curl.se/) command in a terminal:`,
          postInstructions:
            "Replace the `offset` query parameters to retrieve all the pages. " +
            "You can use `$(seq 0 " + MAX_DATASETS + " " + this.totalNumberOfExpressionExperiments + ")` to get a sequence of values for the offset."
        },
        {
          label: "HTTP/1.1",
          language: "http",
          instructions: `To use with your favourite HTTP client.`,
          postInstructions: "Replace the `offset` query parameter to retrieve all the pages. " +
            "Values for `offset` can range from 0 to " + formatNumber(this.totalNumberOfExpressionExperiments) + " by increments of " + MAX_DATASETS + "."
        }
      ];

      // Modify the content based on the searchSettings prop
      let query = this.browsingOptions.query;
      let filter = this.browsingOptions.filter?.map(subClauses => subClauses.join(" or "))?.join(" and ");
      let sort = this.browsingOptions.sort;

      // if the uncompressed URL is too long, always use the compressed filter
      // TODO: remove this when gemma.R and gemmapy supports filter compression (see https://github.com/PavlidisLab/GemBrow/issues/78)
      if (this.uncompressedUrl.length > MAX_URL_LENGTH) {
        console.warn("The uncompressed URL is too long, the compressed filter will be displayed in the R/Python snippets.");
        filter = this.compressedFilter;
      }

      // Gemmapy snippet
      let queryGemmapy = [];
      if (query !== undefined) {
        queryGemmapy.push(`query=${this.escapePythonString(query)}`);
      }
      if (filter !== undefined && filter.length > 0) {
        if (queryGemmapy.length > 0) {
          queryGemmapy.push(", ");
        }
        queryGemmapy.push(`filter=${this.escapePythonString(filter)}`);
      }
      if (queryGemmapy.length > 0) {
        if (sort !== undefined) {
          queryGemmapy.push(`, sort=${this.escapePythonString(sort)}`);
        }

        queryGemmapy.unshift(`import gemmapy\n` +
          `api = gemmapy.GemmaPy()\n` +
          `data = api.get_all_pages(api.get_datasets,`);
        queryGemmapy.push(`)\n`)
      } else {
        queryGemmapy.push(`import gemmapy\n` + 
        `api = gemmapy.GemmaPy()\n` + 
        `data = api.get_all_pages(api.get_datasets)`
        )
      }
      tabs[0].content = queryGemmapy.join("");

      // Gemma.R snippet
      let queryGemmaR = [];
      queryGemmaR.push(`BiocManager::install("gemma.R")\n` + 
      `library(gemma.R)\n`+ 
      `library(dplyr)\n` + 
      `data <- get_datasets(`);

      if (query !== undefined){
        queryGemmaR.push(`query = ${this.escapeRString(query)}`);
      }
      if (filter !== undefined && filter.length > 0) {
        if (queryGemmaR.length > 1){
          queryGemmaR.push(`, `);
        }
        queryGemmaR.push(`filter = ${this.escapeRString(filter)}`);
      }
      if (sort !== undefined){
        if (queryGemmaR.length > 1){
          queryGemmaR.push(`, `);
        }
        queryGemmaR.push(`sort = ${this.escapeRString(sort)}`)
      }

      queryGemmaR.push(`) %>% \n` +
          `\tgemma.R::get_all_pages()`);

      tabs[1].content = queryGemmaR.join("");

      // curl snippet
      tabs[2].content = `curl -X 'GET' --compressed -H 'accept: application/json' ${this.escapeShellString(this.compressedUrl)}`;

      // HTTP/1.1 snippet
      const parsedBaseUrl = new URL(this.compressedUrl);
      tabs[3].content = `GET ${parsedBaseUrl.pathname}${parsedBaseUrl.search} HTTP/1.1\nHost: ${parsedBaseUrl.hostname}\nAccept: application/json`;


      return tabs;
    }
  },
  created() {
    compressFilter(this.browsingOptions.filter).then((result) => {
      this.compressedFilter = result;
    });
  },
  watch: {
    "browsingOptions.filter": function(newVal) {
      compressFilter(newVal).then((result) => {
        this.compressedFilter = result;
      });
    }
  },
  methods: {
    renderMarkdown(markdown) {
      return marked.parseInline(markdown);
    },
    /**
     * Emit a resize event when the selected tab changes. This a workaround
     * because the v-menu that holds the snippet does not reposition itself when
     * the height of the snippet changes. See https://github.com/PavlidisLab/GemBrow/issues/39
     * for the full details.
     *
     * There is a 150ms delay and debounce to wait until the resize animation
     * completes.
     */
    emitResize: debounce(function() {
      this.$emit("resize");
    }, 150),
    copy(content) {
      // copy the snippet to the clipboard
      navigator.clipboard.writeText(content);
    },
    /**
     * Escape and produce a valid R string.
     */
    escapeRString(query) {
      return "'" + query.replace(/['\\]/g, "\\$&") + "'";
    },
    /**
     * Escape and produce a valid Python string.
     */
    escapePythonString(query) {
      return "'" + query.replace(/['\\]/g, "\\$&") + "'";
    },
    /**
     * Escape and produce a valid shell string.
     */
    escapeShellString(query) {
      return "'" + query.replace(/['\\]/g, "\\$&") + "'";
    }
  }
};
;
</script>

<style scoped>
.scroll {
    overflow-y: scroll;
    max-height: calc(100vh - 100px);
}
</style>