<script>
export default {
  methods: {
    scoreToIcon(score) {
      return score > 0.45
        ? "mdi-emoticon-happy"
        : score > 0.1
          ? "mdi-emoticon-neutral"
          : "mdi-emoticon-sad";
    },
    scoreToColor(score) {
      score = score * 1.6; // Puts 0.3 almost in the middle (close enough)
      // Cut off anything > 1
      score = score > 1 ? 1 : score;
      // Cut off negative values
      score = score < 0 ? 0 : score;
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
