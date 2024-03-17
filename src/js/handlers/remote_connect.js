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
  const resultToken = await oauthClient.getIdToken(codeVerifier, authCode);
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
  const { profile } = await oauthClient.getUserConfig(resultToken.id_token);
  await localRepo.set({ remoteConnectInfo, remoteConfigProfile: profile });
}

export async function remoteRefreshIdToken() {
  const localRepo = StorageProvider.getLocalRepository();
  const { remoteConnectInfo } = await localRepo.get(['remoteConnectInfo']);
  const { subdomain, clientId, refreshToken } = remoteConnectInfo;

  const oauthClient = new OAuthClient(subdomain, clientId);
  
  const now = nowEpochSeconds();
  const resultToken = await oauthClient.getIdTokenByRefresh(refreshToken);
  await localRepo.set({
    remoteConnectParams: {
      idToken: resultToken.id_token,
      expiresAt: now + resultToken.expires_in - 15,
      apiEndpoint: `https://api.${subdomain}.aesr.dev`,
    }
  });
}

export async function getRemoteConnectInfo() {
  const localRepo = StorageProvider.getLocalRepository();
  const { remoteConnectInfo } = await localRepo.get(['remoteConnectInfo']);
  const { subdomain, clientId } = remoteConnectInfo;
  return { subdomain, clientId };
}
