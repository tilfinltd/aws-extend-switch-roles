(async function () {
  const form = document.getElementById('AESR_form');

  const reqBody = {
    account: form.account.value,
    color: form.color.value,
    displayName: form.displayName.value,
    redirectUri: decodeURIComponent(form.redirect_uri.value),
    roleName: form.roleName.value,
  };

  const url = form.getAttribute('action');
  const res = await fetch(url, {
    body: JSON.stringify(reqBody),
    headers: {
        "X-CSRF-PROTECTION": "1",
        "content-type": "application/json"
    },
    method: "POST",
    credentials: "include"
  });

  const resultEl = document.getElementById('AESR_result');
  try {
    const resBody = await res.json();
    resultEl.value = resBody.destination;
  } catch (e) {
    resultEl.value = '';
  }
  resultEl.dispatchEvent(new Event('change'));
})();
