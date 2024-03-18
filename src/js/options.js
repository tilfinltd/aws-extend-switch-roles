import { ConfigParser } from 'aesr-config';
import { nowEpochSeconds } from './lib/util.js';
import { loadConfigIni, saveConfigIni } from './lib/config_ini.js';
import { ColorPicker } from './lib/color_picker.js';
import { SessionMemory, StorageProvider } from './lib/storage_repository.js';
import { writeProfileSetToTable } from "./lib/profile_db.js";
import { remoteConnect, getRemoteConnectInfo, deleteRemoteConnectInfo } from './handlers/remote_connect.js';
import { OAuthClient } from './remote/oauth-client.js';

function elById(id) {
  return document.getElementById(id);
}

const sessionMemory = new SessionMemory(chrome || browser)

window.onload = function() {
  const syncStorageRepo = StorageProvider.getSyncRepository();
  let configStorageArea = 'sync';
  let colorPicker = new ColorPicker(document);

  elById('switchConfigHubButton').onclick = function() {
    updateRemoteFieldsState('disconnected');
  }
  elById('cancelConfigHubButton').onclick = function() {
    updateRemoteFieldsState('not_shown');
  }
  elById('connectConfigHubButton').onclick = function() {
    const subdomain = elById('configHubDomain').value;
    const clientId = elById('configHubClientId').value;
    remoteConnect(subdomain, clientId).catch(err => {
      updateMessage('remoteMsgSpan', err.message, 'warn');
    });
  }
  elById('disconnectConfigHubButton').onclick = function() {
    updateRemoteFieldsState('disconnected');
    deleteRemoteConnectInfo();
  }
  elById('reloadConfigHubButton').onclick = function() {
    getRemoteConnectInfo().then(({ subdomain, clientId, refreshToken }) => {
      if (subdomain && clientId) {
        const oaClient = new OAuthClient(subdomain, clientId);
        oaClient.getIdTokenByRefresh(refreshToken).then(idToken => {
          return oaClient.getUserConfig(idToken);
        }).then(({ profile }) => {
          return writeProfileSetToTable(profile);
        }).then(() => {
          updateMessage('remoteMsgSpan', "Successfully reloaded config from Hub!");
        }).catch(e => {
          updateMessage('remoteMsgSpan', `Failed to reload because ${e.message}`, 'warn');
        });
      }
    });
  }

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

  elById('saveButton').onclick = function() {
    try {
      const area = elById('configStorageSyncRadioButton').checked ? 'sync' : 'local';
      saveConfiguration(textArea.value, area).then(() => {
        updateMessage('msgSpan', 'Configuration has been updated!');
      })
      .catch(lastError => {
        let msg = lastError.message
        if (lastError.message === "A mutation operation was attempted on a database that did not allow mutations.") {
          msg = "Configuration cannot be saved while using Private Browsing."
        }
        updateMessage('msgSpan', msg, 'warn');
      });
    } catch (e) {
      updateMessage('msgSpan', `Failed to save because ${e.message}`, 'warn');
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

      getRemoteConnectInfo().then(({ subdomain, clientId, refreshToken }) => {
        if (subdomain && clientId) {
          elById('configHubDomain').value = subdomain;
          elById('configHubClientId').value = clientId;
          if (refreshToken) {
            updateRemoteFieldsState('connected');
          } else {
            updateRemoteFieldsState('disconnected');
            updateMessage('remoteMsgSpan', "Please reconnect because your credentials have expired.", 'warn');
          }
        }
      });
    } else {
      signinEndpointInHereCheckBox.disabled = true;
      const schb = elById('switchConfigHubButton')
      schb.disabled = true;
      schb.title = 'Supporters only';
    }
  });
  booleanSettings.push('signinEndpointInHere');

  elById('configSenderIdText').onchange = function() {
    syncStorageRepo.set({ configSenderId: this.value });
  }

  elById('configStorageSyncRadioButton').onchange = elById('configStorageLocalRadioButton').onchange = function(e) {
    if (this.value === 'sync') {
      // local to sync
      const localStorageRepo = StorageProvider.getLocalRepository();
      const now = nowEpochSeconds();
      loadConfigIni(localStorageRepo)
      .then(text => {
        if (text) {
          return saveConfigIni(syncStorageRepo, text)
        }
      })
      .then(() => {
        return Promise.all([
          syncStorageRepo.set({ configStorageArea: 'sync', profilesLastUpdated: now }),
          localStorageRepo.set({ profilesTableUpdated: now }),
        ])
      })
      .catch(err => {
        e.preventDefault();
        alert(err.message);
        elById('configStorageLocalRadioButton').checked = true;
      });
    } else {
      // sync to local
      syncStorageRepo.set({ configStorageArea: 'local' })
      .catch(err => {
        e.preventDefault();
        alert(err.message);
        elById('configStorageSyncRadioButton').checked = true;
      });
    }
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
  const syncRepo = StorageProvider.getSyncRepository();
  const localRepo = StorageProvider.getLocalRepository();
  const now = nowEpochSeconds();

  await saveConfigIni(localRepo, text);
  if (storageArea === 'sync') {
    await saveConfigIni(syncRepo, text);
    await syncRepo.set({ profilesLastUpdated: now });
  }

  const profileSet = ConfigParser.parseIni(text);
  await writeProfileSetToTable(profileSet);
  await localRepo.set({ profilesTableUpdated: now });
}

function updateMessage(elId, msg, cls = 'success') {
  const el = elById(elId);
  const span = document.createElement('span');
  span.className = cls;
  span.textContent = msg;
  const child = el.firstChild;
  if (child) {
    el.replaceChild(span, child);
  } else {
    el.appendChild(span);
  }

  if (cls === 'success') {
    setTimeout(() => {
      span.remove();
    }, 2500);
  }
}

function updateRemoteFieldsState(state) {
  if (state === 'connected') {
    elById('configHubPanel').style.display = 'block';
    elById('standalonePanel').style.display = 'none';
    elById('configHubDomain').disabled = true;
    elById('configHubClientId').disabled = true;
    elById('cancelConfigHubButton').style.display = 'none';
    elById('connectConfigHubButton').style.display = 'none';
    elById('disconnectConfigHubButton').style.display = 'inline-block';
    elById('reloadConfigHubButton').style.display = 'inline-block';
  } else if (state === 'disconnected') {
    elById('configHubPanel').style.display = 'block';
    elById('standalonePanel').style.display = 'none';
    elById('configHubDomain').disabled = false;
    elById('configHubClientId').disabled = false;
    elById('cancelConfigHubButton').style.display = 'inline-block';
    elById('connectConfigHubButton').style.display = 'inline-block';
    elById('disconnectConfigHubButton').style.display = 'none';
    elById('reloadConfigHubButton').style.display = 'none';
  } else { // not shown
    elById('standalonePanel').style.display = 'block';
    elById('configHubPanel').style.display = 'none';
  }
}
