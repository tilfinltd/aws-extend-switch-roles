function elById(id) {
  return document.getElementById(id);
}

function getAccountId(elId) {
  var el = elById(elId);
  if (!el) return null;

  var aid = el.textContent;
  var r = aid.match(/^(\d{4})\-(\d{4})\-(\d{4})$/);
  if (r) {
    return r[1] + r[2] + r[3];
  } else {
    return aid;
  }
}

function getAssumedRole() {
  var el = elById('awsc-role-display-name-user');
  if (el) {
    return el.textContent.trim();
  }

  el = elById('awsc-login-display-name-user');
  if (el) {
    return el.textContent.trim().split("/")[0]
  }

  return null;
}
