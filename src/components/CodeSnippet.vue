<template>
   <v-tabs>
    <v-tab v-for="language in snippetLanguages" :key="language" @click.stop="">{{ language }}</v-tab>
    <v-tab-item v-for="language in snippetLanguages" :key="language" @click.stop=""> 
        <v-card flat>
        <v-card-text>
            {{  browsingOptions }}
            code typey type <!-- eventually get code for this from Code Snippet-->
        </v-card-text>
        <v-card-actions>
            <v-btn type @click="copyCode()">Copy</v-btn>
        </v-card-actions>
        </v-card>
    </v-tab-item>
    </v-tabs>
</template>

<script>
export default {
    props: {
        browsingOptions: Object
    },
    data() {
        return {
            snippetLanguages: ["curl", "Gemmapy", "Gemma.R"]
        }
    }
}
</script>



<style scoped>

</style>