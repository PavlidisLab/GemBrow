<template>
    <v-container grid-list-lg>
        <v-flex xl12>
            <v-card height="200px" flat>
                <v-card-media :src="require('@/assets/sadGemma.png')" height="180" contain class="themeable light"/>
            </v-card>
        </v-flex>
        <v-layout row wrap>
            <v-flex xl12>
                <v-card class="text-xs-left" height="200px">
                    <v-card-title primary-title class="headline error">
                        Gemma could not find what you were looking for...
                    </v-card-title>
                    <v-card-text>
                        <p>You can try one of the following options:</p>
                        <v-container>
                            <ul>
                                <li>
                                    <router-link to="/">Go to the home page and try again</router-link>
                                </li>
                            </ul>
                        </v-container>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
export default {
  name: "not-found"
};
</script>

<style scoped>
</style>
