export default {
  /**
   * Base URL for Gemma
   */
  baseUrl:
    process.env.NODE_ENV === "production"
      ? "https://gemma.msl.ubc.ca"
      : "https://dev.gemma.msl.ubc.ca"
};
