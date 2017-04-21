window.onload = function() {
  var colorPicker = new ColorPicker(document);

  var selection = [];
  var textArea = document.querySelector('#awsConfigTextArea');
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

  var msgSpan = document.querySelector('#msgSpan');
  var saveButton = document.querySelector('#saveButton');
  saveButton.onclick = function() {
    var rawstr = textArea.value;

    try {
      var data = loadAwsConfig(rawstr);
      localStorage['rawdata'] = rawstr;

      chrome.storage.sync.set({ profiles: data, rawtext: rawstr },
        function() {
          msgSpan.innerHTML = '<span style="color:#1111dd">Updated configuration!</span>';
          setTimeout(function() {
            msgSpan.innerHTML = '';
          }, 2500);
        });
    } catch (e) {
      msgSpan.innerHTML = '<span style="color:#dd1111">Failed to save because of invalid format!</span>';
    }
  }

  var hidesHistoryCheckBox = document.querySelector('#hidesHistoryCheckBox');
  hidesHistoryCheckBox.onchange = function() {
    chrome.storage.sync.set({ hidesHistory: this.checked }, function() {});
  }

  chrome.storage.sync.get(['rawtext', 'hidesHistory'], function(data) {
    textArea.value = data.rawtext || localStorage['rawdata'] || '';
    hidesHistoryCheckBox.checked = data.hidesHistory || false;
  });
}
