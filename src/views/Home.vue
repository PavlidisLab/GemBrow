<template>
    <div class="home">
        <v-jumbotron class="jumbotron">
            <v-container fill-height>
                <v-layout align-center>
                    <v-flex text-xs-center>
                        <img src="../assets/logo.png"/>
                        <h1 class="display-3">The Gemma Browser</h1>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-jumbotron>
        <v-container fluid>
            <h2>Welcome to the Gemma dataset and platform browser</h2>
            <br/>
            <v-flex xs12>
                <v-card color="warning" >
                    <v-card-title primary-title class="text-xs-center white--text">
                        <v-spacer/>
                        <div class="headline">Work in progress</div>
                        <v-spacer/>
                    </v-card-title>
                    <v-card-actions>
                        <v-spacer/>
                        <v-icon class="spin" color=" darken-1">settings</v-icon>
                        <v-spacer/>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-container>
    </div>
</template>

<script>
export default {
  name: "home"
};
</script>

<style scoped lang="scss">
@import "../assets/const.scss";

.jumbotron {
  background: linear-gradient(70deg, $blue2, $yellowGreen);
}

.jumbotron h1 {
  color: $light1;
}

.jumbotron img {
  height: $dim5 * 3;
}
</style>
