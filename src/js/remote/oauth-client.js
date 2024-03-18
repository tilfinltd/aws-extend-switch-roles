import { createCodeChallenge, createCodeVerifier } from './code-util.js';

export class OAuthClient {
  constructor(subdomain, clientId) {
    this.domain = subdomain + '.aesr.dev';
    this.clientId = clientId;
  }

  async startAuthFlow() {
    const codeVerifier = createCodeVerifier();
    const codeChallenge = await createCodeChallenge(codeVerifier);

    const authorizeUrl = `https://auth.${this.domain}/oauth2/authorize`
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: `https://api.${this.domain}/callback`,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge
    })

    return {
      authorizeUrl: authorizeUrl + '?' + params.toString(),
      codeVerifier,
      codeChallenge,
    };
  }

  validateCallbackUrl(uRL) {
    if (uRL.host === `api.${this.domain}` && uRL.pathname === '/callback') {
      const authCode = uRL.searchParams.get('code');
      if (authCode) return authCode;
    }
  }

  async verify(codeVerifier, authCode) {
    const params = {
      grant_type: 'authorization_code',
      client_id: this.clientId,
      redirect_uri: `https://api.${this.domain}/callback`,
      code: authCode,
      code_verifier: codeVerifier
    };

    const res = await fetch(`https://auth.${this.domain}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    });
    const result = await res.json();
    return result;
  }

  async getIdTokenByRefresh(refreshToken) {
    const params = {
      grant_type: 'refresh_token',
      client_id: this.clientId,
      refresh_token: refreshToken,
    };

    const res = await fetch(`https://auth.${this.domain}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    });
    const result = await res.json();
    return result.id_token;
  }

  async getUserConfig(idToken) {
    const res = await fetch(`https://api.${this.domain}/user/config`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + idToken,
      },
    })
    const result = await res.json();
    return result;
  }
}
