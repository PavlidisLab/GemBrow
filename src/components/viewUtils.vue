<script>
export default {
  methods: {
    renderScore(score) {
      {
        return (
          "<i aria-hidden='true' class='score icon mdi " +
          this.scoreToIcon(score) +
          "' style='background-color:" +
          this.scoreToColor(score) +
          "'></i>"
        );
      }
    },
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
    }
  }
};
</script>
