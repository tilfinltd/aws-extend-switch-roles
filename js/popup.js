
window.onload = function() {
  var textArea = document.querySelector('#awsConfigTextArea');

  var msgSpan = document.querySelector('#msgSpan');
  var saveButton = document.querySelector('#saveButton');
  saveButton.onclick = function() {
    var rawstr = textArea.value;

    try {
      var data = loadAwsConfig(rawstr);
      localStorage['rawdata'] = rawstr;

      chrome.storage.sync.set({ profiles: data }, function() {
        msgSpan.innerHTML = '<span style="color:#1111dd">Updated configuraton!</span>';
        setTimeout(function() {
          msgSpan.innerHTML = '';
        }, 2500);
      });
    } catch (e) {
      msgSpan.innerHTML = '<span style="color:#dd1111">Failed to save because of invalid format!</span>';
    }
  }

  var str = localStorage['rawdata'];
  if (str) textArea.value = str;
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
    var iams = parts[0].split(':');

    item.aws_account_id = iams[4];
    item.role_name = parts[1];

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

    if (item && line.length > 0) {
      var field = parseKeyValue(line);
      item[field.key] = field.value;
    } else if (r = line.match(/^\[(.+)\]$/)) {
      var pname = r[1].trim();
      pname = pname.replace(/^profile\s/i, '');
      item = { profile: pname };
    } else {
      profiles.push(brushProfile(item));
      item = null;
    }
  })
  if (item) profiles.push(brushProfile(item));

  //document.querySelector('#resultTextArea').value = JSON.stringify(profiles);
  return profiles;
}
