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
const percentFormatter = Intl.NumberFormat(undefined, { style: "percent" });
const decimalFormatter = Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

export function formatNumber(n) {
  return numberFormat.format(n);
}

export function formatPercent(p) {
  return percentFormatter.format(p);
}

export function formatDecimal(d) {
  return decimalFormatter.format(d);
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