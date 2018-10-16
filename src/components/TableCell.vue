<template>
    <span>
        <span :title="tip">
            <v-icon :color="iconColor" :class="iconClass" :style="iconStyle" v-if="icon" >{{icon}}</v-icon>
            {{ text }}
        </span>
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
