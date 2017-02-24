function ColorPicker(doc) {
  var colorPicker = doc.getElementById('colorPicker');
  var colorValue = doc.getElementById('colorValue');
  this.onpick = null;

  var me = this;

  colorPicker.oninput = function() {
    var rrggbb = this.value.substr(1);
    colorValue.value = rrggbb;
    if (me.onpick != null) {
      me.onpick(rrggbb);
    }
  }

  colorValue.oninput = function() {
    colorPicker.value = '#'+this.value;
    if (me.onpick != null) {
      me.onpick(this.value);
    }
  }

  colorValue.oninput = function() {
    colorPicker.value = '#'+this.value;
  }

  colorValue.onkeypress = function(evt) {
    if (evt.keyCode === 13) {
      if (me.onpick != null) {
        me.onpick(this.value);
      }
    }
  }
}

ColorPicker.prototype.setColor = function(color){
  colorPicker.value = '#'+color;
  colorValue.value = color;
}


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
          msgSpan.innerHTML = '<span style="color:#1111dd">Updated configuraton!</span>';
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


function parseKeyValue(line) {
  var strs = line.split('=', 2);
  var key = strs[0].trim();
  var val = strs[1].trim();
  return { key: key, value: val };
}

function brushProfile(item) {
  if (item.role_arn) {
    var parts = item.role_arn.split('/');
    var iams = parts.shift().split(':');

    item.aws_account_id = iams[4];
    item.role_name = parts.join('/');

    delete item.role_arn;
  }

  return item;
}


function loadAwsConfig(text) {
  var profiles = [];
  var lines = text.split(/\r\n|\r|\n/);

  var item = null;
  lines.forEach(function(rawline) {
    var line = rawline.trim();
    var field, r;

    var firstChar = line.charAt(0);
    if (firstChar === ';' || firstChar === '#') {
      line = ''; // Comment Line
    }

    if (r = line.match(/^\[(.+)\]$/)) {
      if (item) profiles.push(brushProfile(item));

      var pname = r[1].trim();
      pname = pname.replace(/^profile\s+/i, '');
      item = { profile: pname };
    } else if (item) {
      if (line.length > 0) {
        var field = parseKeyValue(line);
        item[field.key] = field.value;
      } else {
        profiles.push(brushProfile(item));
        item = null;
      }
    }
  })
  if (item) profiles.push(brushProfile(item));

  //document.querySelector('#resultTextArea').value = JSON.stringify(profiles);
  return profiles;
}
