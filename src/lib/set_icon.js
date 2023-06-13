export function setIcon(path) {
  const details = { path };
  const brw = chrome || browser;
  if (brw.action) {
    // Manifest v3
    return brw.action.setIcon(details);
  }
}
