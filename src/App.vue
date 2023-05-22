<template>
    <v-app>
        <!--
        <v-app-bar app>
            <v-app-bar-nav-icon to="/">
                <img
                        id="logo"
                        :src="require('@/assets/logo-icon.png')"
                        class="themeable light"
                        alt="The Gemma Browser logo"
                />
            </v-app-bar-nav-icon>
        </v-app-bar>
        -->
        <router-view/>
        <!--
        <v-footer app>
            <v-container>
                <v-row justify="center">
                    <v-col>
                        <a href="https://www.ubc.ca/" target="_blank" title="UBC home page">
                            <img
                                    :src="require('@/assets/ubc-logo.png')"
                                    height="50px"
                                    alt="UBC Logo"
                            />
                            University of British Columbia &copy; 2018-2023
                        </a>
                    </v-col>
                </v-row>
            </v-container>
        </v-footer>
        -->
    </v-app>
</template>

<script>
import "vuetify/dist/vuetify.css";
import "material-icons";
import gemmaConfig from "./config/gemma";

const app = {
  config: {
    gemma: gemmaConfig
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
