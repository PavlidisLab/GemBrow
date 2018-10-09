<template>
    <v-card flat v-if="!this.user">
        <v-card-text>
            <v-text-field
                    v-model="uname"
                    type="text"
                    name="usr-uname"
                    label="Username"
                    required
            ></v-text-field>
            <v-text-field
                    v-model="pwd"
                    :append-icon="hidePwd ? 'visibility' : 'visibility_off'"
                    :append-icon-cb="() => (hidePwd = !hidePwd)"
                    :type="hidePwd ? 'password' : 'text'"
                    name="usr-pwd"
                    label="Password"
                    required
            ></v-text-field>
        </v-card-text>
        <v-card-actions>
            <v-spacer/>
            <v-btn flat v-on:click="closeDialog()">Cancel</v-btn>
            <v-btn color="primary" v-on:click="login()">Login</v-btn>
        </v-card-actions>
    </v-card>
    <v-card flat v-else>
        <v-card-title primary-title>
            <h3>
                <v-tooltip left v-if="this.user && this.user.isAdmin">
                    <v-icon slot="activator">mdi-security-account</v-icon>
                    User is an administrator
                </v-tooltip>
                <v-tooltip left v-else>
                    <v-icon slot="activator">mdi-account</v-icon>
                    User logged in
                </v-tooltip>
                {{this.user.userName}}
            </h3>
        </v-card-title>
        <v-card-text>
            {{this.user.email}}
        </v-card-text>
        <v-divider/>
        <v-card-actions>
            <v-btn color="primary" v-on:click="logout()">Logout</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import { mapState } from "vuex";
import { axiosInst } from "../store/modules/vapi";

export default {
  name: "UserForm",
  props: ["value"],
  data: function() {
    return {
      pwd: "",
      uname: "",
      hidePwd: true
    };
  },
  mounted() {
    // Update axios headers with state stored info
    this.updateAuth();
  },
  computed: {
    ...mapState({
      user: state => state.main.user,
      pending: state => state.api.users.pending
    })
  },
  methods: {
    closeDialog() {
      if (this.value) {
        this.$emit("input", false);
      }
    },
    login() {
      // Update axios authentication headers
      this.updateAuth();

      // Call the rest api endpoint to retrieve user information
      this.$store
        .dispatch("api/getusers", {
          params: {
            id: this.uname
          }
        })
        .then(() => {
          if (!this.$store.state.api.error.users) {
            // If we got a successful reply from backend, execute frontend login
            this.$store.dispatch("main/login", this.$store.state.api.users);
          }
          // Apply details from received object
          this.updateAuth();
        });
      // Wipe the password input
      this.pwd = "";
      this.updateAuth();
    },
    logout() {
      // Execute backend logout
      this.$store.dispatch("api/logout");
      // Execute frontend logout
      this.$store.dispatch("main/logout");

      // Reset admin-only filters
      this.$store.dispatch("dss/setTroubled_on", false);
      this.$store.dispatch("pfs/setTroubled_on", false);

      // Wipe the login form
      this.uname = "";
      this.pwd = "";

      // Update axios authentication headers
      this.updateAuth();

      this.$root.$emit("logout");
    },
    updateAuth() {
      // Axios conf has to be reset, otherwise old properties linger
      let conf = {
        headers: null,
        auth: null
      };
      if (this.user) {
        // If the user object is set, we keep whatever the login form provided before. (received is a pwd hash)
      } else if (this.uname && this.pwd) {
        // if the user is not set, but the login form info is provided (necessary to execute the backend login request)
        conf = {
          auth: {
            username: this.uname,
            password: this.pwd
          }
        };
        Object.assign(axiosInst.defaults, conf);
      }
    }
  }
};
</script>
