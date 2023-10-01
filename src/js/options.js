import { deleteConfigIni, loadConfigIni, saveConfigIni } from './lib/config_ini.js';
import { ColorPicker } from './lib/color_picker.js';
import { SessionMemory, StorageProvider } from './lib/storage_repository.js';
import { loadAwsConfig } from './lib/load_aws_config.js';
import { writeProfileItemsToTable } from "./lib/profile_db.js";

function elById(id) {
  return document.getElementById(id);
}

const sessionMemory = new SessionMemory(chrome || browser)

window.onload = function() {
  const syncStorageRepo = StorageProvider.getSyncRepository();
  let configStorageArea = 'sync';
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
    try {
      saveConfiguration(textArea.value, configStorageArea).then(() => {
        updateMessage(msgSpan, 'Configuration has been updated!', 'success');
        setTimeout(() => {
          msgSpan.firstChild.remove();
        }, 2500);
      })
      .catch(lastError => {
        updateMessage(msgSpan, lastError.message, 'warn');
      });
    } catch (e) {
      updateMessage(msgSpan, `Failed to save because ${e.message}`, 'warn');
    }
  }

  const booleanSettings = ['hidesAccountId', 'showOnlyMatchingRoles', 'autoAssumeLastRole'];
  for (let key of booleanSettings) {
    elById(`${key}CheckBox`).onchange = function() {
      syncStorageRepo.set({ [key]: this.checked });
    }
  }
  const signinEndpointInHereCheckBox = elById('signinEndpointInHereCheckBox');
  sessionMemory.get(['hasGoldenKey'])
  .then(({ hasGoldenKey }) => {
    if (hasGoldenKey) {
      signinEndpointInHereCheckBox.onchange = function() {
        syncStorageRepo.set({ signinEndpointInHere: this.checked });
      }
    } else {
      signinEndpointInHereCheckBox.disabled = true;
    }
  });
  booleanSettings.push('signinEndpointInHere');

  elById('configSenderIdText').onchange = function() {
    syncStorageRepo.set({ configSenderId: this.value });
  }

  elById('configStorageSyncRadioButton').onchange = elById('configStorageLocalRadioButton').onchange = function(e) {
    const preStorageRepo = StorageProvider.getRepositoryByKind(configStorageArea);
    configStorageArea = this.value;
    const postStorageRepo = StorageProvider.getRepositoryByKind(configStorageArea);

    loadConfigIni(preStorageRepo)
    .then(text => {
      if (text) {
        return saveConfigIni(postStorageRepo, text)
          .then(() => deleteConfigIni(preStorageRepo));
      }
    })
    .then(() => syncStorageRepo.set({ configStorageArea }))
    .catch(err => {
      e.preventDefault();
      alert(err.message);
    });
  }

  elById('defaultVisualRadioButton').onchange = elById('lightVisualRadioButton').onchange = elById('darkVisualRadioButton').onchange = function() {
    const visualMode = this.value;
    syncStorageRepo.set({ visualMode });
    if (visualMode === 'dark' || (visualMode === 'default' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('darkMode');
    } else {
      document.body.classList.remove('darkMode');
    }
  }

  syncStorageRepo.get(['configSenderId', 'configStorageArea', 'visualMode'].concat(booleanSettings))
  .then(data => {
    elById('configSenderIdText').value = data.configSenderId || '';
    for (let key of booleanSettings) {
      elById(`${key}CheckBox`).checked = data[key] || false;
    }

    configStorageArea = data.configStorageArea || 'sync'
    switch (configStorageArea) {
      case 'sync':
        elById('configStorageSyncRadioButton').checked = true
        break;
      case 'local':
        elById('configStorageLocalRadioButton').checked = true
        break;
    }

    const visualMode = data.visualMode || 'default'
    elById(visualMode + 'VisualRadioButton').checked = true;
    if (visualMode === 'dark' || (visualMode === 'default' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('darkMode');
    }

    loadConfigIni(StorageProvider.getRepositoryByKind(configStorageArea)).then(cfgText => {
      textArea.value = cfgText || '';
    });
  });
}

async function saveConfiguration(text, storageArea) {
  const storageRepo = StorageProvider.getRepositoryByKind(storageArea);
  await saveConfigIni(storageRepo, text);

  const items = loadAwsConfig(text);
  await writeProfileItemsToTable(items, true);
}

function updateMessage(el, msg, cls) {
  const span = document.createElement('span');
  span.className = cls;
  span.textContent = msg;
  const child = el.firstChild;
  if (child) {
    el.replaceChild(span, child);
  } else {
    el.appendChild(span);
  }
}
