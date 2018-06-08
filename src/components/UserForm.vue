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
            <h3>{{this.user.userName}}</h3>
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
      this.updateAuth();
      this.$store
        .dispatch("api/getusers", {
          params: {
            id: this.uname
          }
        })
        .then(() => {
          if (!this.$store.state.api.error.users) {
            this.$store.dispatch("main/login", this.$store.state.api.users);
          }
          this.pwd = "";
          this.uname = "";
        })
        .catch(() => {
          this.pwd = "";
          this.uname = "";
          this.updateAuth();
        });
    },
    logout() {
      this.$store.dispatch("main/logout");
      this.uname = "";
      this.pwd = "";
      this.updateAuth();
    },
    updateAuth() {
      // Axios conf has to be reset, otherwise old properties linger
      let conf = {
        headers: null,
        auth: null
      };
      if (this.uname && this.pwd) {
        conf = {
          auth: {
            username: this.uname,
            password: this.pwd
          }
        };
      }
      Object.assign(axiosInst.defaults, conf);
    }
  }
};
</script>
