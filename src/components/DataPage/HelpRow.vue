<template>
    <div class="wrapper">
        <div>
            <v-layout row wrap v-on:click="value = !value" class="switch-row">
                <v-icon :color="value ? 'blue lighten-2' : ''">mdi-help</v-icon>
                <v-icon v-if="!value">mdi-menu-right</v-icon>
                <v-icon v-if="value" color="blue lighten-2">mdi-menu-down</v-icon>
                <v-switch :label="label" class="switch">
                    <!--Using switch to match the style of the filter row-->
                </v-switch>
            </v-layout>
            <v-card v-if="value" flat tile class="content">
                <v-card-text>
                    <slot name="content"/>
                </v-card-text>
            </v-card>
        </div>
        <v-divider v-if="value"></v-divider>
    </div>
</template>

<script>
import ViewUtils from "../ViewUtils";

export default {
  name: "HelpRow",
  props: {
    propName: String,
    label: String
  },
  computed: {
    value: {
      get() {
        return this.$store.state.help[this.propName];
      },
      set(value) {
        // noinspection JSIgnoredPromiseFromCall
        this.$store.dispatch(
          "help/set" + ViewUtils.methods.capitalize(this.propName),
          value
        );
      }
    }
  }
};
</script>

<style scoped lang="scss">
@import "../../assets/const";

.wrapper {
  padding: 0;
}

.wrapper > div {
  padding: $dim2 $dim3 - 4 $dim2 $dim3 + 4;
}

.switch-row {
  cursor: pointer;
}
</style>
