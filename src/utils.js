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