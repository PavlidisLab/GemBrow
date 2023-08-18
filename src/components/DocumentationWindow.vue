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
                <h3 > Filters </h3>
                <h4 style="font-weight: normal">How do the browser's filter options work?</h4>
                    <p> There are three main categories you can use to filter data: Taxa, Platforms, and Annotations. Annotations is further divided into sub-categories. </p>
                    <p><strong>AND Filters:</strong> When multiple filters <em>across</em> the main categories and Annotation sub-categories are selected, they are combined using the Boolean operator "AND". This means that all selected filters need to be satisfied. For example, if both "Human" in the Taxa category and "Alzheimer Disease" in the Annotations' Disease sub-category are selected, the results will include experiments that involve human subjects AND are annotated with "Alzheimer Disease". The same approach is used when different sub-categories within Annotations are used as filters (e.g., experiments filtered by both "Breast Cancer" from Disease sub-category AND "BRCA1" from Genotype sub-category must contain both terms). Each added AND filter usually decreases the number of experiments displayed in the table. </p>
                    <p><strong>OR Filters:</strong> When multiple filters are selected <em>within</em> the main categories or Annotations' sub-categories, they are combined using the Boolean operator "OR". This means that at least one of the selected filters needs to be satisfied. For example, a selection of both "Human" and "Mouse" within Taxa category will result in a list of experiments that involve either human OR mouse. Each added OR filter usually increases the number of experiments displayed in the table. </p>
                <h4 style="font-weight: normal"> What do the numbers represent? </h4>
                    <p> The numbers displayed next to each filter option represent the number of experiments that contain that term <em>subject</em> to all other previously selected filters external to the current category/Annotations sub-category, (e.g., if "Human" is selected in the Taxa category, the number next to "Alzheimer Disease" in the Disease sub-category represents the count of human experiments relating to "Alzheimer Disease"; this count will not change if "Parkinson Disease" is also selected). Within each Annotation sub-category, terms with small numbers of occurrences (i.e. less than 4) may not be shown; please use the 'search' functionality if something you are seeking is not listed. The value in the top bar represents the number of experiments that pass the selection filters. Note that because the categories and annotations within Gemma are not mutually exclusive (e.g., a study can contain both "Schizophrenia" and "Autism Spectrum Disorder" annotations), this value may vary slightly from the sum of the values displayed next to filter selection options. </p>
                <h4 style="font-weight: normal"> Where do the annotations come from? </h4>
                    <p> The categories and terms shown are derived from the concepts associated with datasets. Datasets are annotated to capture the most salient features of the experimental setting and design (e.g., the treatments applied to certain parts of organisms at specific life stages to study particular diseases).</p>
                <br>
                <h3>Buttons</h3>
                    <p> When a filtering selection has been made, a summary of the filter categories used will be displayed in the top bar of the browser. To view the full details of the filters applied, click on <v-btn plain style="text-transform: none;" small> Filters applied: <v-icon>mdi-chevron-down</v-icon></v-btn> icon. Click anywhere to exit the pop-up window.</p>

                    <p> To download a .tsv file with the list of experiments from current selection, click this <v-btn plain small><v-icon>mdi-download</v-icon></v-btn> icon. Click <v-btn plain small><v-icon>mdi-cancel</v-icon></v-btn> icon to cancel downloads. </p>

                    <p> The gene expression data corresponding to the selected experiments can be accessed using Gemma's API. Click on <v-btn plain small style="text-transform: none;">Dataset Download Code <v-icon>mdi-chevron-up</v-icon></v-btn>,  select a tab, and use the <v-btn plain small><v-icon>mdi-clipboard-outline</v-icon></v-btn> icon to copy the code that downloads the expression data for the current experiment selection using python, R, curl, or HTTP. Click anywhere to exit the pop-up window.</p>
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