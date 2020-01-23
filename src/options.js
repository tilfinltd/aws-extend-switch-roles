function elById(id) {
  return document.getElementById(id);
}

window.onload = function() {
  var colorPicker = new ColorPicker(document);

  var selection = [];
  var textArea = elById('awsConfigTextArea');
  textArea.onselect = function() {
    var str = this.value.substring(this.selectionStart, this.selectionEnd);
    var r = str.match(/^([0-9a-fA-F]{6})$/);
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

  var msgSpan = elById('msgSpan');
  var saveButton = elById('saveButton');
  saveButton.onclick = function() {
    var rawstr = textArea.value;

    try {
      const profiles = loadAwsConfig(rawstr);

      const dps = new DataProfilesSplitter();
      const dataSet = dps.profilesToDataSet(profiles);

      chrome.storage.sync.set(dataSet,
        function() {
          const { lastError } = chrome.runtime || browser.runtime;
          if (lastError) {
            msgSpan.innerHTML = `<span style="color:#dd1111">${lastError.message}</span>`;
            return;
          }

          msgSpan.innerHTML = '<span style="color:#1111dd">Configuration has been updated!</span>';
          setTimeout(function() {
            msgSpan.innerHTML = '';
          }, 2500);
        });
    } catch (e) {
      msgSpan.innerHTML = `<span style="color:#dd1111">${e.message}</span>`;
    }
  }

  const booleanSettings = ['hidesHistory', 'hidesAccountId', 'showOnlyMatchingRoles'];
  for (let key of booleanSettings) {
    elById(`${key}CheckBox`).onchange = function() {
      chrome.storage.sync.set({ [key]: this.checked });
    }
  }

}
