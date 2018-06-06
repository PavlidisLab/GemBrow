<template>
    <v-card flat v-if="this.user === null">
        <v-form>
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
                <v-btn color="primary">Login</v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
    <v-card flat v-else-if="this.user !== null">
        <v-card-title primary-title>{{this.user.username}}</v-card-title>
        <v-divider/>
        <v-card-actions>
            <v-btn color="primary">Logout</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import { mapState } from "vuex";

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
      user: state => state.main.user
    })
    // pwd: "",
    // uname: ""
  },
  methods: {
    closeDialog() {
      if (this.value) {
        this.$emit("input", false);
      }
    }
  }
};
</script>

<style scoped>
</style>
