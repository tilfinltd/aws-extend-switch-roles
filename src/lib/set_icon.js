export function setIcon(details) {
  const brw = chrome || browser;
  return brw.action.setIcon(details);
}
