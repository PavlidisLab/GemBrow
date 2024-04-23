import axios from "axios";

/**
 * Download a given data blob, file or media source.
 *
 * @param data {Blob|File|MediaSource}
 * @param filename {string}
 */
export function downloadAs(data, filename) {
  let a = document.createElement("a");
  let url = URL.createObjectURL(data);
  try {
    a.setAttribute("href", url);
    a.setAttribute("download", filename);
    a.click();
  } finally {
    URL.revokeObjectURL(url);
    a.remove();
  }
}

const numberFormat = new Intl.NumberFormat();
const percentFormatter = new Intl.NumberFormat(undefined, { style: "percent" });
const decimalFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

export function formatNumber(n) {
  return numberFormat.format(n);
}

export function formatPercent(p) {
  return percentFormatter.format(p);
}

export function formatDecimal(d) {
  return decimalFormatter.format(d);
}

export function pluralize(s) {
  if (s.endsWith("y")) {
    return s.slice(0, -1) + "ies";
  }
  return s.endsWith("x") || s.endsWith("s") ? s + "es" : s + "s";
}

/**
 * Compress a given filter with gzip and encode it with base64. If the compressed filter is bigger, then the
 * original filter is returned.
 * @return {Promise<String>} a promise that resolves with a compressed filter
 */
export function compressArg(f) {
  // too short, not worth compressing
  if (f.length < 150) {
    return Promise.resolve(f);
  }
  let reader = new Blob([f]).stream()
    .pipeThrough(new CompressionStream("gzip"))
    .getReader();
  let blob = "";
  return reader.read().then(function processChunk({ value, done }) {
    if (value) {
      blob += String.fromCharCode.apply(null, value);
    }
    // complete or process the next chunk only if the base64-encoded blob is smaller than the original filter
    if (Math.ceil(blob.length / 3) * 4 < f.length) {
      if (done) {
        return btoa(blob);
      } else {
        return reader.read().then(processChunk);
      }
    } else {
      return f;
    }
  });
}

/**
 * Compress a filter represented as an array of arrays of strings.
 * @param {Array<Array<String>>} filter
 * @returns {Promise<String>} a promise that resolves with the compressed filter
 */
export function compressFilter(filter) {
  return compressArg(filter.map(a => a.join(" or ")).join(" and "));
}

/**
 * Obtain the category ID for a given term.
 * @returns {string|null} an ID for the category or null if the term is uncategorized
 */
export function getCategoryId(term) {
  return term.classUri || term.className?.toLowerCase() || null;
}

/**
 * Obtain the term ID for a given term.
 * @returns {string} an ID for the term
 */
export function getTermId(term) {
  return term.termUri || term.termName?.toLowerCase();
}

/**
 * Swallow a cancelled request error.
 * @throws Error the passed error if it is not a cancelled request error
 */
export function swallowCancellation(err) {
  if (axios.isCancel(err)) {
    console.warn("Request was cancelled, swallowing the error...", err);
  } else {
    throw err;
  }
}