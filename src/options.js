function elById(id) {
  return document.getElementById(id);
}

window.onload = function() {
  let colorPicker = new ColorPicker(document);

  let selection = [];
  let textArea = elById('awsConfigTextArea');
  textArea.onselect = function() {
    let str = this.value.substring(this.selectionStart, this.selectionEnd);
    let r = str.match(/^([0-9a-fA-F]{6})$/);
    if (r !== null) {
      colorPicker.setColor(r[1]);
      selection = [this.selectionStart, this.selectionEnd];
      colorPicker.onpick = function(newColor) {
        str = textArea.value;
        textArea.value = str.substring(0, selection[0]) + newColor + str.substring(selection[1]);
      }
    } else {
      selection = [];
      colorPicker.onpick = null;
    }
  }

  let msgSpan = elById('msgSpan');
  let saveButton = elById('saveButton');
  saveButton.onclick = function() {
    let rawstr = textArea.value;

    saveAwsConfig(rawstr, function(res) {
      if(res.result === 'failure') {
        msgSpan.innerHTML = `<span style="color:#dd1111">${res.error.message}</span>`
      }
      else {
        msgSpan.innerHTML = `<span style="color:#1111dd">${res.message}</span>`
        setTimeout(function () {
          msgSpan.innerHTML = '';
        }, 2500);
      }
    });
  }

  const booleanSettings = ['hidesAccountId', 'showOnlyMatchingRoles', 'autoAssumeLastRole', 'profileLocalStorage'];
  for (let key of booleanSettings) {
    elById(`${key}CheckBox`).onchange = function() {
      chrome.storage.sync.set({ [key]: this.checked });
    }
  }

  elById('configSenderIdText').onchange = function() {
    chrome.storage.sync.set({ configSenderId: this.value });
  }

  chrome.storage.sync.get(['configSenderId'].concat(booleanSettings), function(data) {
    const storageType = data.profileLocalStorage ? 'local' : 'sync'
    chrome.storage[storageType].get(['lztext'], function(data) {
      let rawData = localStorage['rawdata'];
      if (data.lztext) {
        try {
          rawData = LZString.decompressFromUTF16(data.lztext);
        } catch(err) {
          rawdata = ';; !!!WARNING!!!\n;; Latest setting is broken.\n;; !!!WARNING!!!\n';
        }
      }
      textArea.value = rawData || '';
    });
    elById('configSenderIdText').value = data.configSenderId || '';
    for (let key of booleanSettings) {
      elById(`${key}CheckBox`).checked = data[key] || false;
    }

    if ('hidesHistory' in data) {
      // clean deprecated key
      chrome.storage.sync.remove(['hidesHistory'], () => {})
    }
  });
}

function updateMessage(el, msg, color) {
  const span = document.createElement('span');
  span.style.color = color;
  span.textContent = msg;
  const child = el.firstChild;
  if (child) {
    el.replaceChild(span, child);
  } else {
    el.appendChild(span);
  }
}
