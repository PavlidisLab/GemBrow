<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card title="test">
                    <v-card-title>{{ dataset.shortName || "No name" }}</v-card-title>
                    <v-card-text>
                        view this dataset on <a :href="gemmaDatasetUrl">{{ this.dataset.shortName }}</a>.
                        <a :href="gemmaPlatformUrl()">Gemma</a>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
function Platform(id, shortName) {
  this.id = id;
  this.shortName = shortName;
}

function Dataset(id, shortName, platform) {
  this.id = id;
  this.shortName = shortName;
  this.platform = platform;
}

export default {
  name: "Dataset",
  props: {
    "id": String
  },
  data() {
    return {
      dataset: new Dataset(this.id, "", new Platform(1, ""))
    };
  },
  methods: {
    gemmaDatasetUrl() {
      return "https://gemma.msl.ubc.ca/expressionExperiment/showExpressionExperiment.html?id=" + this.dataset.id;
    },
    gemmaPlatformUrl() {
      return "https://gemma.msl.ubc.ca/expressionExperiment/showArrayDesign.html?id=" + this.dataset.platform.id;
    }
  }
};
</script>

<style scoped>

</style>