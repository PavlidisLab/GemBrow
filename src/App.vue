<template>
        <v-app dark>
            <div id="nav">
                <router-link to="/">Home</router-link>
                |
                <router-link to="/datasets">Datasets</router-link>
                |
                <router-link to="/platforms">Platforms</router-link>
                |
                <a v-on:click="toggleTheme()">Switch theme</a>
            </div>
            <router-view/>
        </v-app>
</template>

<script>
import Vue from "vue";
import Vuetify from "vuetify";
import "babel-polyfill";
import "vuetify/dist/vuetify.css";
import "material-icons";

Vue.use(Vuetify);

export default {
  data: function() {
    return {
      theme: "dark"
    };
  },
  methods: {
    toggleTheme: function() {
      this.theme = this.theme === "dark" ? "light" : "dark";
      document.getElementById("app").className =
        "application theme--" + this.theme;
    }
  }
};
</script>

<style lang="scss">
@import "assets/const.scss";

html,
body {
  height: 100%;
  margin: 0;
}

@media (max-width: 767px) {
  main {
    margin: $dim3 $dim0 $dim0;
  }
}

#app h1,
#app h2,
#app h3,
#app h4 {
  font-weight: 700;
  font-family: "Roboto", sans-serif !important;
}

#app {
  text-align: center;
  display: flex;
  flex-flow: column;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#nav {
  padding: 30px;
}

a {
  text-decoration: none;
  font-weight: bold;
}

// Theme dependent

.application.theme--dark img.themeable.dark,
.application.theme--light img.themeable.light {
  filter: invert(80%);
}

.application.theme--dark a {
  color: $light1;
}

.application.theme--light a {
  color: $dark1;
}

// Imported css customisation

/// Vuetify theme

.application.theme--dark {
  background: $dark0;
  color: $light1;
}

.application.theme--light {
  background: $light1;
  color: $dark1;
}

/// md icons
.md-spin {
  animation: spin infinite 2s linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
