<script>
export default {
  methods: {
    scoreToIcon(score) {
      return score > 0.3
        ? "mdi-emoticon-happy"
        : score > -0.3
          ? "mdi-emoticon-neutral"
          : "mdi-emoticon-sad";
    },
    scoreToColor(score) {
      // normalize from [-1,1] to [0,1]
      score = score + 1;
      score = score / 2;
      // hsl red = 0° and green = 120°
      const hue = score * 120;
      return "hsl(" + hue + ", 100%, 70%)";
    },
    capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }
};
</script>
