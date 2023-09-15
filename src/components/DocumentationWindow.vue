<template>
    <v-dialog :value="value" @input="newVal => $emit('input', newVal)" width="800">
        <v-card>
            <v-card-title>
                Documentation
                <v-spacer></v-spacer>
                <v-btn icon @click="$emit('input', false)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text>
                <h3>Please note:</h3>
                    <p>When you filter using terms in multiple categories, they are combined using “AND” logic. Example: if you choose a Disease and an Organism Part. </p>
                    <p>When you filter using multiple terms within a category, they are combined using “OR” logic. Example: if you choose multiple Diseases. </p>
                    <p>The number shown next to the term is the count for that category; you may see more data sets in your result set coming from uses of the term in other categories.</p>
                <br>
                <h3>Buttons</h3>
                    <p> When a filtering selection has been made, a summary of the filter categories used will be displayed in the top bar of the browser. To view the full details of the filters applied, click on <v-btn plain style="text-transform: none;" small> Filters applied: <v-icon>mdi-chevron-down</v-icon></v-btn> icon. Click anywhere to exit the pop-up window.</p>
                    <p> To expand the preview window for all datasets on the page, click <v-btn text color="grey darken-2" style="text-transform: none;"><v-icon color="grey darken-2">mdi-chevron-down</v-icon>Expand all datasets</v-btn> button. If all datasets are expanded, click <v-btn text color="grey darken-2" style="text-transform: none;"><v-icon color="grey darken-2">mdi-chevron-up</v-icon>Collapse all datasets</v-btn> to collapse all datasets. </p>
                    <p> To download a .tsv file with the list of experiments from current selection, click this <v-btn plain small><v-icon>mdi-download</v-icon></v-btn> icon. Click <v-btn plain small><v-icon>mdi-cancel</v-icon></v-btn> icon to cancel downloads. </p>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
export default {
  props: {
    value: Boolean
  }
};
</script>

<style scoped>
h3 {
    text-transform: uppercase;
    }
</style>