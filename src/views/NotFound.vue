<template>
    <v-container grid-list-xl>
        <v-layout row wrap>
            <v-flex xs12 md4 order-md2 >
                <v-card fill-height flat>
                    <v-card-media :src="require('@/assets/sadGemma.png')" height="200px" fill-height contain class="themeable light"/>
                </v-card>
            </v-flex>
            <v-flex xs12 md8>
                <v-card class="text-xs-left">
                    <v-card-title primary-title class="headline error">
                        Gemma could not find what you were looking for...
                    </v-card-title>
                    <v-card-text>
                        <p>You can try one of the following options:</p>
                        <v-container>
                            <ul>
                                <li>
                                    <router-link to="/">Go to the home page and try again...</router-link>
                                </li>
                                <li>
                                    <router-link to="/">If you are logged in, try logging out and back in.</router-link>
                                </li>
                                <li>
                                    <router-link to="/">If the problem persists, please let us know!</router-link>
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
