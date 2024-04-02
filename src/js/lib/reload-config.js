import { OAuthClient, RefreshTokenError } from "../remote/oauth-client.js";
import { writeProfileSetToTable } from "./profile_db.js";
import { deleteRefreshTokenFromRemoteConnectInfo } from "../handlers/remote_connect.js";

export async function reloadConfig(remoteConnectInfo) {
  const oaClient = new OAuthClient(remoteConnectInfo.subdomain, remoteConnectInfo.clientId);
  try {
    const idToken = await oaClient.getIdTokenByRefresh(remoteConnectInfo.refreshToken);
    const { profile } = await oaClient.getUserConfig(idToken);
    await writeProfileSetToTable(profile);
    console.log('Updated profile from Config Hub');
    return true;
  } catch (err) {
    if (err instanceof RefreshTokenError) {
      await deleteRefreshTokenFromRemoteConnectInfo();
      console.log('Refresh token is expired');
      return false;
    }
    throw err;
  }
}
