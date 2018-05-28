<template>
    <v-app> <!--class is applied with the update() hook-->
        <v-navigation-drawer
                app
                v-model="drawer"
                right
                clipped
                :hide-overlay="true"
                :disable-resize-watcher="true"
                temporary
                :value="false"
        >
            <v-list>
                <v-list-tile v-for="item in routes" :key="item.title" :to="item.route">
                    <v-list-tile-action>
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-divider/>
                <v-list-tile v-for="item in actions" :key="item.title" v-on:click="item.action">
                    <v-list-tile-action>
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
        <v-toolbar app>
            <v-toolbar-side-icon to="/">
                <img id="logo" src="./assets/logo_icon.png" class="themeable light">
            </v-toolbar-side-icon>
            <v-toolbar-title>
                <router-link to="/">Gembrow</router-link>
            </v-toolbar-title>
            <v-spacer/>
            <v-toolbar-items class="hidden-xs-only">
                <v-btn flat v-for="item in routes" :key="item.title" :to="item.route">{{item.title}}</v-btn>
                <v-btn flat v-for="item in actions" :key="item.title" v-on:click="item.action" :title="item.title">
                    <v-icon>{{item.icon}}</v-icon>
                </v-btn>
            </v-toolbar-items>
            <v-toolbar-items class="hidden-sm-and-up">
                <v-btn flat @click.stop="drawer = !drawer">
                    <v-icon>menu</v-icon>
                </v-btn>
            </v-toolbar-items>
        </v-toolbar>
        <v-content>
            <router-view/>
        </v-content>
        <v-footer app absolute>
            <v-flex xs12 text-xs-center>&copy; 2018 UBC</v-flex>
        </v-footer>
    </v-app>
</template>

<script>
import Vue from "vue";
import Vuetify from "vuetify";
import "babel-polyfill";
import "vuetify/dist/vuetify.css";
import "material-icons";
import VueLodash from "vue-lodash";

Vue.use(VueLodash);
Vue.use(Vuetify);

export default {
  data() {
    return {
      drawer: null,
      routes: [
        { title: "Datasets", route: "/datasets" },
        { title: "Platforms", route: "/platforms" }
      ]
    };
  },
  computed: {
    dark() {
      return this.$store.state.main.themeDark;
    },
    appClass() {
      return "application theme--" + (this.dark ? "dark" : "light");
    },
    actions() {
      return [
        {
          title: this.lightsTitle,
          icon: this.lightsIcon,
          action: this.toggleTheme
        }
      ];
    },
    lightsTitle() {
      return "Lights " + (this.dark ? "on" : "off");
    },
    lightsIcon() {
      return this.dark ? "brightness_high" : "brightness_4";
    }
  },
  methods: {
    toggleTheme() {
      // noinspection JSIgnoredPromiseFromCall
      this.$store.dispatch("main/toggleTheme");
    }
  },
  updated() {
    // Manual class setting to prevent the theme class being applied
    document.getElementById("app").className = this.appClass;
  }
};
</script>

<style lang="scss">
@import "assets/const.scss";

html,
body {
  height: 100%;
  margin: 0;
  overflow-y: auto;
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

a {
  text-decoration: none;
  font-weight: bold;
}

// Theme dependent

.application.theme--dark .themeable.dark,
.application.theme--light .themeable.light {
  filter: invert(80%);
}

.application.theme--dark a {
  color: $light1;
}

.application.theme--light a {
  color: $dark1;
}

// Animations

/// md icons
.spin {
  animation: spin infinite 2s linear;
}

.spin.inv {
  animation-direction: reverse;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Imported css customisation

/// Vuetify theme

.application.theme--dark {
  background: $dark1;
  color: $light1;
}

.application.theme--light {
}

.application.theme--dark .toolbar {
  background-color: $dark1;
}
</style>
