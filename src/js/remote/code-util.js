
export function createCodeVerifier() {
  const data = randomData(50);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let str = '', buf = data[0];
  let i = 1, li = data.length - 1, blen = 8;
  while (true) {
    str += chars[buf % 64];
    if (i === li) break;
    blen -= 6;
    buf = buf >> 6;
    if (blen < 6) {
      buf += (data[++i] << blen);
      blen += 8;
    }
  }
  return str;
}

function randomData(len) {
  const arr = new Uint8Array(len);
  return window.crypto.getRandomValues(arr);
}

export async function createCodeChallenge(verifier) {
  const hash = await createSha256(verifier);
  return encodeBase64URL(new Uint8Array(hash));
}

async function createSha256(str) {
  const data = new TextEncoder().encode(str);
  return window.crypto.subtle.digest('SHA-256', data);
}

function encodeBase64URL(bytes) {
  const buf = window.btoa(String.fromCharCode(...bytes))
  return buf.replace(/([+/=])/g, (_m, p1) => {
    return p1 == '+' ? '-' : p1 == '/' ? '_' : '';
  });
}
