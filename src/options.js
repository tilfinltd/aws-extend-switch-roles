function elById(id) {
  return document.getElementById(id);
}

// taken from: https://davidwalsh.name/convert-image-data-uri-javascript
// converted to return a promise
function getDataUri(profile) {
  return new Promise(function(resolve, reject) {
    var image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');

    image.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = 64; // or 'width' if you want a special/scaled size
      canvas.height = 64; // or 'height' if you want a special/scaled size

      canvas.getContext('2d').drawImage(this, 0, 0, 64, 64);

      // get as Data URI
      profile.imagedata = canvas.toDataURL('image/png')
      console.log(`Got data uri for: ${profile.image}: ${profile.imagedata}`);
      resolve(profile);
    };
    image.onerror = function() {
      console.error(`Failed to load image: ${profile.image}`);
      reject(profile)
    }

    console.log(`Getting data uri for: ${profile.image}`);
    image.src = profile.image.replace(/"/g, '');
  })
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
      if (profiles.length > 200) {
        msgSpan.innerHTML = '<span style="color:#dd1111">Failed to save bacause the number of profiles exceeded maximum 200!</span>';
        return;
      }
      // map the profiles to promises. if there is an image specification but no
      // imagedata attribute then generate the data-uri otherwise resolve to the
      // original profile
      Promise.all(profiles.map(function(profile) {
        if (profile.image && !profile.imagedata) {
          return getDataUri(profile)
        }
        return new Promise(function(resolve, reject) {
          resolve(profile)
        });
      })).then(values => {
        // parse the rawstr into a list of lines or profiles (where each profile
        // is a list of lines) preserving comments and formatting so that we can
        // just add the imagedata lines. NOTE: the data parser turns comments
        // and empty lines into profile separators
        const lines = rawstr.split('\n');
        const profileLines = [];
        let output = "";
        let currentProfile = undefined;
        lines.forEach(function(line) {
          if (r = line.match(/^\[(.+)\]$/)) {
            var pname = r[1].trim();
            pname = pname.replace(/^profile\s+/i, '');
            currentProfile = {
              profile: pname,
              lines: [line]
            };
            profileLines.push(currentProfile);
          } else {
            if (currentProfile) {
              currentProfile.lines.push(line);
            } else {
              output += line;
            }
          }
        });

        // re-render the profiles as string to update the UI and local storage
        output += profileLines.map(function(profile) {
          let match = values.find(function(value) {
            return value.profile === profile.profile
          });
          // only add an imagedata line if there isn't one
          if (!profile.lines.find(function(line) { return line.startsWith('imagedata'); })) {
            console.log('no imagedata');
            // add it after the image line if there is one
            const index = profile.lines.findIndex(function(line) { return line.startsWith('image'); });
            if (index > -1) {
              profile.lines = profile.lines.slice(0, index + 1)
                .concat([`imagedata = ${match.imagedata}`])
                .concat(profile.lines.slice(index + 1));
            }
          }
          return profile.lines.join('\n');
        }).join('\n');

        localStorage['rawdata'] = output;
        textArea.value = output;

        const dps = new DataProfilesSplitter();
        const dataSet = dps.profilesToDataSet(values);
        dataSet.lztext = LZString.compressToUTF16(output);

        chrome.storage.sync.set(dataSet,
          function() {
            const { lastError } = chrome.runtime || browser.runtime;
            if (lastError) {
              msgSpan.innerHTML = Sanitizer.escapeHTML`<span style="color:#dd1111">${lastError.message}</span>`;
              return;
            }

            msgSpan.innerHTML = '<span style="color:#1111dd">Configuration has been updated!</span>';
            setTimeout(function() {
              msgSpan.innerHTML = '';
            }, 2500);
          });
      }).catch(error => {
        console.log(error.message);
      });
    } catch(e) {
      msgSpan.innerHTML = '<span style="color:#dd1111">Failed to save because of invalid format!</span>';
    }
  }

  const booleanSettings = ['hidesHistory', 'hidesAccountId', 'showOnlyMatchingRoles', 'autoAssumeLastRole'];
  for (let key of booleanSettings) {
    elById(`${key}CheckBox`).onchange = function() {
      chrome.storage.sync.set({ [key]: this.checked });
    }
  }

  elById('configSenderIdText').onchange = function() {
    chrome.storage.sync.set({ configSenderId: this.value });
  }

  chrome.storage.sync.get(['lztext', 'configSenderId'].concat(booleanSettings), function(data) {
    let rawData = localStorage['rawdata'];
    if (data.lztext) {
      try {
        rawData = LZString.decompressFromUTF16(data.lztext);
      } catch(err) {
        rawdata = ';; !!!WARNING!!!\n;; Latest setting is broken.\n;; !!!WARNING!!!\n';
      }
    }
    textArea.value = rawData || '';
    elById('configSenderIdText').value = data.configSenderId || '';
    for (let key of booleanSettings) {
      elById(`${key}CheckBox`).checked = data[key] || false;
    }
  });
}
