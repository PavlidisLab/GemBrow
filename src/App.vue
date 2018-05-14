<template>
    <div id="app">
        <v-app>
            <div id="nav">
                <router-link to="/">Home</router-link>
                |
                <router-link to="/about">About</router-link>
            </div>
            <router-view/>
        </v-app>
    </div>
</template>

<script>
import Vue from "vue";
import Vuetify from "vuetify";
import "babel-polyfill";
import "vuetify/dist/vuetify.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";

Vue.use(Vuetify);

// MD Icons
import FaceIcon from "vue-material-design-icons/face";
import BorderTopIcon from "vue-material-design-icons/border-top";

Vue.component("face-icon", FaceIcon);
Vue.component("border-top-icon", BorderTopIcon);

export default {};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
