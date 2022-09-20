export function createRoleListItem(document, item, url, region, { hidesAccountId }, selectHandler) {
  const li = document.createElement('li');
  const headSquare = document.createElement('span');
  headSquare.textContent = ' ';
  headSquare.className = 'headSquare';
  if (item.color) {
    headSquare.style.backgroundColor = `#${item.color}`;
  } else if (!item.image) {
    // set gray if both color and image are undefined
    headSquare.style.backgroundColor = '#aaaaaa';
  }
  if (item.image) {
    headSquare.style.backgroundImage = `url('${item.image.replace(/"/g, '')}')`;
  }

  const anchor = document.createElement('a');
  anchor.href = "#";
  anchor.title = item.role_name + '@' + item.aws_account_id;
  anchor.dataset.profile = item.profile;
  anchor.dataset.rolename = item.role_name;
  anchor.dataset.account = item.aws_account_id;
  anchor.dataset.color = item.color || 'aaaaaa';
  anchor.dataset.redirecturi = createRedirectUri(url, region, item.region);
  anchor.dataset.search = item.profile.toLowerCase() + ' ' + item.aws_account_id;

  anchor.appendChild(headSquare);
  anchor.appendChild(document.createTextNode(item.profile));

  if (hidesAccountId) {
    anchor.dataset.displayname = createDisplayName(item.profile);
  } else {
    anchor.dataset.displayname = createDisplayName(item.profile, item.aws_account_id);

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

function createRedirectUri(currentUrl, curRegion, destRegion) {
  let redirectUri = currentUrl;
  if (curRegion && destRegion && curRegion !== destRegion) {
    redirectUri = redirectUri.replace('region=' + curRegion, 'region=' + destRegion);
  }
  return encodeURIComponent(redirectUri);
}

function createDisplayName(profile, aws_account_id) {
  const maxLength = 64;
  const separator = '  |  ';
  const overflow = '…';

  let displayName = profile;
  let totalLength = displayName.length;

  if (aws_account_id !== undefined) {
    totalLength += separator.length + aws_account_id.length;
  }

  if (totalLength > maxLength) {
    displayName = displayName.substring(0, displayName.length - (totalLength - maxLength) - overflow.length)
                  + overflow;
  }

  if (aws_account_id !== undefined) {
    displayName += separator + aws_account_id;
  }
  
  return displayName;
}
