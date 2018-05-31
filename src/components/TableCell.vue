<template>
    <span>
        <span v-if="!tip">
            <v-icon :color="iconColor" :class="iconClass" :style="iconStyle" v-if="icon">{{icon}}</v-icon>
            {{ text }}
        </span>
        <v-tooltip bottom v-if="tip">
            <span slot="activator">
                <v-icon :color="iconColor" :class="iconClass" :style="iconStyle" v-if="icon">{{icon}}</v-icon>
                {{ text }}
            </span>
            <span>{{ tip }}</span>
        </v-tooltip>
    </span>
</template>

<script>
export default {
  name: "TableCell",
  props: {
    tip: String,
    icon: String,
    iconColor: String,
    iconStyle: String,
    iconClass: String,
    text: String
  }
};
</script>

<style scoped>
</style>
