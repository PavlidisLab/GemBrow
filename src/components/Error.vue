<template>
    <v-alert type="error">
        <div v-if="debug">
            <pre style="white-space: pre-wrap;">{{ JSON.stringify(error) }}</pre>
        </div>
        <div v-else class="d-flex align-">
            An error has occurred. The Gemma Browser is still under development and we will greatly appreciate
            you report it to us.
            <v-spacer/>
            <v-btn :href="'mailto:' + mail.to + '?subject=' + encodeURIComponent(mail.subject) + '&body=' + encodeURIComponent(mail.body)" class="align-self-center">
                <v-icon>mdi-email</v-icon>
                Report by email
            </v-btn>
            <v-btn @click="revealErrorDetails = true" class="ml-1 align-self-center">
                <v-icon>mdi-github</v-icon>
                Report on GitHub
            </v-btn>
        </div>
        <div v-show="revealErrorDetails">
            <p class="my-3">Make sure that you include the following details in the issue:</p>
            <v-card class="my-3">
                <v-card-text>
                    <pre class="mb-1" style="white-space: pre-wrap;">{{ JSON.stringify(error) }}</pre>
                    Application Version: {{ applicationVersion }}<br>
                    Browser: {{ browser }}
                </v-card-text>
            </v-card>
            <v-btn href="https://github.com/PavlidisLab/GemBrow/issues/new"
                   target="_blank" rel="noreferrer noopener">
                <v-icon>mdi-github</v-icon>
                Create an issue on GitHub
            </v-btn>
        </div>
    </v-alert>
</template>

<script>

import { mapState } from "vuex";

export default {
  name: "Error",
  props: {
    error: Object
  },
  data() {
    return {
      revealErrorDetails: false,
      applicationVersion: process.env.VUE_APP_VERSION,
      browser: navigator.userAgent
    };
  },
  computed: {
    ...mapState(["debug"]),
    mail() {
      return {
        to: "pavlab-support@msl.ubc.ca",
        subject: "Gemma Browser Bug Report: " + this.error.message,
        body: "Please indicate how this error can be reproduced here:\n"
          + "\n\n\n"
          + "Error details:\n" + JSON.stringify(this.error) + "\n"
          + "\n"
          + "Application Version: " + this.applicationVersion + "\n"
          + "Browser: " + this.browser
      };
    }
  }
};
</script>

<style scoped>
.v-alert {
    border-radius: 0 !important;
}
</style>