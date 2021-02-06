import { loadAwsConfig } from './lib/load_aws_config.js'
import { ColorPicker } from './lib/color_picker.js'
import { DataProfilesSplitter } from './lib/data_profiles_splitter.js'
import { LZString } from './lib/lz-string.min.js'
import { SyncStorageRepository } from './lib/storage_repository.js'

function elById(id) {
  return document.getElementById(id);
}

const syncStorageRepo = new SyncStorageRepository(chrome || browser)
const configStorageRepo = new SyncStorageRepository(chrome || browser)

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

    try {
      const profiles = loadAwsConfig(rawstr);
      if (profiles.length > 200) {
        updateMessage(msgSpan, 'Failed to save bacause the number of profiles exceeded maximum 200!', '#dd1111');
        return;
      }

      localStorage['rawdata'] = rawstr;

      const dps = new DataProfilesSplitter();
      const dataSet = dps.profilesToDataSet(profiles);
      dataSet.lztext = LZString.compressToUTF16(rawstr);

      configStorageRepo.set(dataSet)
      .then(() => {
        updateMessage(msgSpan, 'Configuration has been updated!', '#1111dd');
        setTimeout(() => {
          msgSpan.firstChild.remove();
        }, 2500);
      })
      .catch(lastError => {
        updateMessage(msgSpan, lastError.message, '#dd1111');
      });
    } catch (e) {
      updateMessage(msgSpan, 'Failed to save because of invalid format!', '#dd1111');
    }
  }

  const booleanSettings = ['hidesAccountId', 'showOnlyMatchingRoles', 'autoAssumeLastRole'];
  for (let key of booleanSettings) {
    elById(`${key}CheckBox`).onchange = function() {
      syncStorageRepo.set({ [key]: this.checked });
    }
  }

  elById('configSenderIdText').onchange = function() {
    syncStorageRepo.set({ configSenderId: this.value });
  }

  syncStorageRepo.get(['lztext', 'configSenderId'].concat(booleanSettings))
  .then(data => {
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

    if ('hidesHistory' in data) {
      // clean deprecated key
      syncStorageRepo.delete(['hidesHistory']).catch(() => {})
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
