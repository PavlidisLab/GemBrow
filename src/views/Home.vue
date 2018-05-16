<template>
    <div class="home">
        <v-jumbotron class="jumbotron">
            <v-container fill-height>
                <v-layout align-left>

                        <img id="logo" src="../assets/logo.png" >
                        <h1>Gembrow</h1>
                </v-layout>
            </v-container>
        </v-jumbotron>

        <HelloWorld msg="Welcome to Your Vue.js App"/>
    </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "../components/HelloWorld.vue";

export default {
  name: "home",
  components: {
    HelloWorld
  }
};
</script>

<style scoped lang="scss">
@import "../assets/const.scss";

#logo {
  height: $dim4 * 5;
}

.jumbotron {
  background: $blue2;
}

.jumbotron h1 {
  float: right;
  font-weight: 700;
  font-size: 350%;
  color: $light1;
  font-family: "Montserrat", sans-serif;
}
</style>
