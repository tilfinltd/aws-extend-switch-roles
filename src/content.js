function appendAESRForm(tryCount) {
  let switchLink= document.querySelector('#menu--account *[data-testid="awsc-switch-roles"]');
  if (!switchLink) {
    if (tryCount === 2) return;
    setTimeout(() => {
      appendAESRForm(++tryCount);
    }, 100);
  }

  const actionHost = new URL(switchLink.href).host;
  const form = document.createElement('form');
  form.id = 'AESR_form';
  form.method = 'POST';
  form.action = `https://${actionHost}/switchrole`;
  form.innerHTML = '<input type="hidden" name="mfaNeeded" value="0"><input type="hidden" name="action" value="switchFromBasis"><input type="hidden" name="src" value="nav"><input type="hidden" name="csrf"><input type="hidden" name="roleName"><input type="hidden" name="account"><input type="hidden" name="color"><input type="hidden" name="redirect_uri"><input type="hidden" name="displayName">';
  document.body.appendChild(form)
}

if (document.body) {
  setTimeout(() => {
    appendAESRForm(0)
  }, 50)
}
