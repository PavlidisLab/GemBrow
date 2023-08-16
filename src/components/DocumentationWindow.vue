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
                    <p> There are three main categories you can use to filter data: Taxa, Technology Type, and Annotations. Annotations is further divided into groupings which behave similarly to categories. </p>
                    <p><strong>AND Filters:</strong> When multiple filters <em>between</em> the major categories and Annotation groupings are selected they act as AND filters. For example, if both "Human" in the Taxa category and "Alzheimer's Disease" in the Annotations category's "Disease" grouping are selected, the results will include experiments that involve human subjects AND are annotated with "Alzheimer's Disease". Different groupings within Annotations are also represented by AND clauses (e.g., experiments filtered by both "Breast Cancer" from Disease grouping AND "BRCA1" from Genotype grouping must contain both tags). Selecting these features will reduce the number of datasets displayed in the table. </p>
                    <p><strong>OR Filters:</strong> Selection of multiple filters <em>within</em> the categories Taxa, Technology Type, and all Annotation groupings represent OR relationships. For example, a selection of both "Human" and "Mouse" within Taxa category will result in a list of experiments that involve either human OR mouse. Adding multiple OR clauses will increase the number of experiments you see in the table. </p>
                <h4 style="font-weight: normal"> What do the numbers show? </h4>
                    <p> The values displayed next to each selection option represent the number of experiments that contain this term <em>subject</em> to all other category selections, but not within-category selections (e.g., if "Human" is selected in the Taxa category, the number next to "Alzheimer Disease" in the Disease Annotation grouping represents the count of experiments relating to "Alzheimer Disease" in humans within Gemma, and will not change subject to a selection of "Parkinson Disease"). Within each Annotation grouping, items with small numbers of occurrences (i.e. less than ~4) may not be shown; please use the ‘search’ functionality if something you are seeking isn’t listed. The value in the top bar represents the number of experiments that pass the selection filters. Note that because the categories and annotations within Gemma are not mutually exclusive (e.g., a study can contain both "Schizophrenia" and "Autism Spectrum Disorder" annotations), this value may vary slightly from the sum of the values displayed next to filter selection options. </p>
                <h4 style="font-weight: normal"> Where do the annotations come from? </h4>
                    <p> The categories and terms shown are derived from the concepts associated with datasets. Datasets are annotated to capture the most salient features of the experimental setting and design (e.g., the treatments applied to certain parts of organisms at specific life stages to study particular diseases).</p>
                <br>
                <h3>Buttons</h3>
                    <p> When filtering selections have been made, a summary of the filter categories used will be displayed in the top bar of the browser. To view a more detailed description of the selections, click this text <v-btn plain style="text-transform: none;" small> Filters applied: <v-icon>mdi-chevron-down</v-icon></v-btn>. Click anywhere to exit the filter description menu.</p>

                    <p> To download a .tsv file with the data from current selections, click this <v-btn plain small><v-icon>mdi-download</v-icon></v-btn>icon. Click <v-btn plain small><v-icon>mdi-cancel</v-icon></v-btn> icon to cancel downloads. </p>

                    <p> Some users may analyse Gemma data in other applications. Once some filtering has been applied, open this window <v-btn plain small style="text-transform: none;">Dataset Download Code <v-icon>mdi-chevron-up</v-icon></v-btn>,  select a tab, and use the <v-btn plain small><v-icon>mdi-clipboard-outline</v-icon></v-btn> icon to copy code that downloads the current filtered dataset with python, R, curl, or HTTP. Click anywhere to exit the menu.</p>
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