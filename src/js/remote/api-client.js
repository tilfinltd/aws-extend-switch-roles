export class ApiClient {
  constructor(subdomain) {
    this.domain = subdomain + '.aesr.dev';
  }

  async fetchUserConfig(idToken) {
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
