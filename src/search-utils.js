/**
 * Apply a highlight to an original text.
 * @param {string} text                orignal text
 * @param highlightedFragment highlighted fragment of the text (contains <b> and </b>)
 * @returns {string}
 */
export function highlight(text, highlightedFragment) {
  let rawFragment = highlightedFragment
    .replace("<b>", "")
    .replace("</b>", "");
  if (!text.includes(rawFragment)) {
    console.warn("\"" + text + "\" does not contain the highlighted fragment \"" + rawFragment + "\"");
    return text;
  }
  return text.replace(rawFragment, highlightedFragment);
}