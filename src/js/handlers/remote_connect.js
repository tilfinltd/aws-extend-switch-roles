import { SessionMemory, StorageProvider } from '../lib/storage_repository.js';
import { nowEpochSeconds } from '../lib/util.js';
import { OAuthClient } from '../remote/oauth-client.js';

const sessionMemory = new SessionMemory(chrome || browser);

export async function remoteConnect(subdomain, clientId) {
  const permparams = { origins: [`https://*.${subdomain}.aesr.dev/*`] };
  const granted = await chrome.permissions.request(permparams);
  if (!granted) return;

  const oauthClient = new OAuthClient(subdomain, clientId);
  const { authorizeUrl, codeVerifier } = await oauthClient.startAuthFlow();
  const remoteConnectParams = { subdomain, clientId, codeVerifier };
  await sessionMemory.set({ remoteConnectParams });

  window.location.href = authorizeUrl;
}

export async function remoteCallback(uRL) {
  const { remoteConnectParams } = await sessionMemory.get(['remoteConnectParams']);
  const { subdomain, clientId, codeVerifier } = remoteConnectParams;

  const oauthClient = new OAuthClient(subdomain, clientId);
  const authCode = oauthClient.validateCallbackUrl(uRL);

  const now = nowEpochSeconds();
  const resultToken = await oauthClient.verify(codeVerifier, authCode);
  await sessionMemory.set({
    remoteConnectParams: {
      idToken: resultToken.id_token,
      expiresAt: now + resultToken.expires_in - 15,
      apiEndpoint: `https://api.${subdomain}.aesr.dev`,
    }
  });

  const localRepo = StorageProvider.getLocalRepository();
  const remoteConnectInfo = {
    subdomain,
    clientId,
    refreshToken: resultToken.refresh_token,
  };
  await localRepo.set({ remoteConnectInfo });
  return await oauthClient.getUserConfig(resultToken.id_token);
}

export async function getRemoteConnectInfo() {
  const localRepo = StorageProvider.getLocalRepository();
  const { remoteConnectInfo } = await localRepo.get(['remoteConnectInfo']);
  return remoteConnectInfo;
}

export function deleteRemoteConnectInfo() {
  const localRepo = StorageProvider.getLocalRepository();
  localRepo.delete(['remoteConnectInfo']);
}

export async function deleteRefreshTokenFromRemoteConnectInfo() {
  const localRepo = StorageProvider.getLocalRepository();
  const { remoteConnectInfo } = await localRepo.get(['remoteConnectInfo']);
  delete remoteConnectInfo.refreshToken;
  await localRepo.set({ remoteConnectInfo });
}
