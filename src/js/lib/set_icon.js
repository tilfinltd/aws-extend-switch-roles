export function setIcon(path) {
  const brw = chrome || browser;
  return brw.action.setIcon({ path });
}
