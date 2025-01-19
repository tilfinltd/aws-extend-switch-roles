(async function () {
  const sessData = document.querySelector('meta[name="awsc-session-data"]').getAttribute('content');
  const { signInEndpoint, sessionDifferentiator } = JSON.parse(sessData);
  const form = document.getElementById('AESR_form');

  const reqBody = {
    account: form.account.value,
    color: form.color.value,
    displayName: form.displayName.value,
    redirectUri: decodeURIComponent(form.redirect_uri.value).replace(`${sessionDifferentiator}.`, ""),
    roleName: form.roleName.value,
  };

  const res = await fetch(`https://${signInEndpoint}/sessions/${sessionDifferentiator}/v1/switchrole`, {
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
    resultEl.dataset.content = resBody.destination;
  } catch (e) {
    resultEl.dataset.content = '';
  }
})();
