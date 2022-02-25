<template>
    <v-app>
        <!--class is applied with the update() hook-->
        <v-dialog v-model="userDialog">
            <UserForm v-model="userDialog"/>
        </v-dialog>
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
                <v-list-item v-for="item in routes" :key="item.title" :to="item.route">
                    <v-list-item-action>
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-divider/>

                <v-list-item
                        @click.native.stop="userDialog = true"
                        v-on:click="userDialog = true"
                >
                    <v-list-item-action>
                        <v-icon v-if="userPending">mdi-loading spin</v-icon>
                        <v-icon v-else-if="this.user !== null">mdi-account</v-icon>
                        <v-icon v-else>mdi-account-outline</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title
                        >{{ this.user === null ? "User login" : this.user.userName }}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-divider/>
                <v-list-item
                        v-for="item in actions"
                        :key="item.title"
                        v-on:click="item.action"
                >
                    <v-list-item-action>
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-app-bar app>
            <v-app-bar-nav-icon to="/">
                <img
                        id="logo"
                        src="./assets/logo-icon.png"
                        class="themeable light"
                        alt="GemBrow Logo"
                />
            </v-app-bar-nav-icon>
            <v-app-bar-title>
                <router-link to="/">GemBrow</router-link>
            </v-app-bar-title>
            <v-spacer/>
            <v-toolbar-items class="hidden-xs-only">
                <v-btn text v-for="item in routes" :key="item.title" :to="item.route"
                >{{ item.title }}
                </v-btn>
                <v-menu
                        open-on-hover
                        bottom
                        offset-y
                        :close-on-content-click="false"
                        v-model="userMenu"
                >
                    <v-btn slot="activator" text>
                        <v-icon v-if="userPending" class="spin inv">sync</v-icon>
                        <v-icon v-else-if="this.user !== null && this.user.isAdmin"
                        >mdi-security-account
                        </v-icon>
                        <v-icon v-else-if="this.user !== null">mdi-account</v-icon>
                        <v-icon v-else>mdi-account-outline</v-icon>
                    </v-btn>
                    <UserForm v-model="userMenu"/>
                </v-menu>
                <v-btn
                        text
                        v-for="item in actions"
                        :key="item.title"
                        v-on:click="item.action"
                        :title="item.title"
                >
                    <v-icon>{{ item.icon }}</v-icon>
                </v-btn>
            </v-toolbar-items>
            <v-toolbar-items class="hidden-sm-and-up">
                <v-btn text @click.stop="drawer = !drawer">
                    <v-icon>menu</v-icon>
                </v-btn>
            </v-toolbar-items>
        </v-app-bar>
        <v-main>
            <router-view/>
        </v-main>
        <footer app>
            <v-container>
                <v-row justify="center">
                    <v-col>
                        <a href="https://www.ubc.ca/" target="_blank" title="UBC home page">
                            <img
                                    :src="require('@/assets/ubc-logo.png')"
                                    height="100px"
                                    alt="UBC Logo"
                            />
                            <h3>University of British Columbia &copy; 2018 &nbsp;&nbsp;</h3>
                        </a>
                    </v-col>
                </v-row>
            </v-container>
        </footer>
    </v-app>
</template>

<script>
import "babel-polyfill";
import "vuetify/dist/vuetify.css";
import "material-icons";
import { mapState } from "vuex";
import UserForm from "./components/UserForm";
import gemmaConfig from "./config/gemma";

const app = {
  data() {
    return {
      drawer: null,
      userDialog: false,
      userMenu: false,
      userPending: false,
      routes: [
        { title: "Datasets", route: "/datasets" },
        { title: "Platforms", route: "/platforms" }
      ]
    };
  },
  config: {
    gemma: gemmaConfig
  },
  components: {
    UserForm: UserForm
  },
  computed: {
    ...mapState({
      user: (state) => state.main.user
    }),
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

export default app;
</script>

<style lang="scss">
@import "assets/const.scss";

$mdi-font-path: "../node_modules/@mdi/font/fonts";
@import "../node_modules/@mdi/font/scss/materialdesignicons.scss";

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
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  text-decoration: none;
  font-weight: bold;
}

.btn.lcase {
  text-transform: none !important;
}

footer {
  text-align: center;
  background: #212121;
  box-shadow: inset 0 5px 5px -5px #ccc;
}

footer h3 {
  color: #f5f5f5 !important;
}

footer img {
  margin: $dim3;
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
