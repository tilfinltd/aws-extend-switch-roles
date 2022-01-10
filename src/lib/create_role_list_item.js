export function createRoleListItem(document, item, currentUrl, { hidesAccountId }, selectHandler) {
  const color = item.color || 'aaaaaa';
  const li = document.createElement('li');
  const headSquare = document.createElement('span');
  headSquare.textContent = ' ';
  headSquare.className = 'headSquare';
  {
    let hsStyle = `background-color: #${color}`;
    if (item.image) hsStyle += `; background-image: url('${item.image.replace(/"/g, '')}');`
    headSquare.style = hsStyle;
  }

  const anchor = document.createElement('a');
  anchor.href = "#";
  anchor.title = item.role_name + '@' + item.aws_account_id;
  anchor.dataset.profile = item.profile;
  anchor.dataset.rolename = item.role_name;
  anchor.dataset.account = item.aws_account_id;
  anchor.dataset.color = color;
  anchor.dataset.redirecturi = createRedirectURI(currentUrl, item.region);
  anchor.dataset.search = item.profile.toLowerCase() + ' ' + item.aws_account_id;

  anchor.appendChild(headSquare);
  anchor.appendChild(document.createTextNode(item.profile));

  if (hidesAccountId) {
    anchor.dataset.displayname = item.profile;
  } else {
    anchor.dataset.displayname = item.profile + '  |  ' + item.aws_account_id;

    const accountIdSpan = document.createElement('span');
    accountIdSpan.className = 'suffixAccountId';
    accountIdSpan.textContent = item.aws_account_id;
    anchor.appendChild(accountIdSpan);
  }

  anchor.onclick = function() {
    const data = { ...this.dataset }; // do not directly refer DOM data in Firefox
    selectHandler(data)
    return false;
  }

  li.appendChild(anchor);

  return li
}

function createRedirectURI(currentURL, destRegion) {
  if (!destRegion) return encodeURIComponent(currentURL.href);

  let redirectUri = currentURL.href;
  const md = currentURL.search.match(/region=([a-z\-1-9]+)/);
  if (md) {
    const currentRegion = md[1];
    if (currentRegion !== destRegion) {
      redirectUri = redirectUri.replace('region=' + currentRegion, 'region=' + destRegion);
    }
  }
  return encodeURIComponent(redirectUri);
}
