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