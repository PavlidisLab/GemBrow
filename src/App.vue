<template>
    <v-app>
        <AppBar/>
        <router-view/>
    </v-app>
</template>

<script>
import "vuetify/dist/vuetify.css";
import "material-icons";
import AppBar from "@/components/AppBar.vue";
import { mapMutations } from "vuex";

function renderError(err) {
  return {
    message: err.message,
    columnNumber: err.columnNumber,
    lineNumber: err.lineNumber,
    fileName: err.fileName,
    stacktrace: err.stack,
    cause: err.cause && renderError(err.cause)
  };
}

export default {
  components: { AppBar },
  methods: mapMutations(["setLastError"]),
  errorCaptured(err) {
    this.setLastError(renderError(err));
  }
};
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
