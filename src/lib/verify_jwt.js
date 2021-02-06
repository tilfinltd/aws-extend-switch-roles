const jwkCertKey = {
  "kty": "RSA",
  "n": "xW3J9jNQz_tAfQVpyqiDv4In-mJduhGinI0asERp9FYqd4UIMGD9GW2D8k5SgXUHrY1-rwVN8-u2YKvVv19r9ofTafpQBcPKOUv4cDGFFNNOoThk6ZkTjJLP4thqp92_hnSkJCh-ixyVuwAvpZCM7TfwJN5XzFAjTrylnsmuVmDWIAcNFns4vkfOOT0U_8EBvQZdiKX-IUa3qqSm0fy1daFcY-fWbiWGN0csk-tufhwRfVjsnsLctN_eCxwvgemZWZ4N1BNUPzN3JlOALd-WfbjyV4eSMWwnTPdRcKkB2MoTcGqBaU8DNadESvcGUB9LoK5_H9rFbQKg77MggA1jQxouhQ00hFcioJ7rynPVd6p_vtjsJ2RrT2_phMOs7bfgsh3wY9PNFSo5L6htaQhrKGEweZG3VIXmtqB2lYwWOBUrxVX3Sbqm3ftDjU3p8sQ6UDpvtNddD0EP0Pc3YnpoYd6wEBUn-5e7jjP-34yGaCs28wAqHfrJtq5_or9JqYZswP95TZQbWg6WUQIcS-gPIRBi4t6kYDak0hTneulwV5RhhDlPETGnyQ1sBObhtGpIoHNgF5_sFtfBF_f7PHFTFVr7sl_fqAUxO6arlYHaDhM3X9gySCyGweaff2llKSNwaiQl1qcwSjPO7bDDZVQRZ4Rh95kRb5LyUeBQkZVAaX8",
  "e": "AQAB"
}

async function verifyJWT(token, key) {
  const decodeBase64Url = (str) => {
    const convmap = {
      '-': '+',
      '_': '/',
    };
    const urlUnsafed = str.replace(/([\-_=])/g, (match, p1) => convmap[p1]);
    return atob(urlUnsafed);
  }

  const toBuffer = (str) => {
    let buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
    return buf;
  }

  const algorithm = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-256' }
  };

  const cryptoKey = await crypto.subtle.importKey('jwk', key, algorithm, true, ['verify']);

  const [head, claim, sig] = token.split('.');
  const signature = toBuffer(decodeBase64Url(sig));
  const payload = toBuffer(`${head}.${claim}`);

  const result = await crypto.subtle.verify(algorithm, cryptoKey, signature, payload);
  if (!result) throw new Error('Failed to verify token')

  const data = JSON.parse(decodeBase64Url(claim));
  if (data.exp && (new Date(data.exp * 1000) < new Date())) throw new Error('Token expired');

  return data;
}

export async function validateKeyCode(keyCode) {
  const lines = keyCode.split('\n');
  const contents = lines.slice(1, -1);
  const metadatas = {};
  let i = 0;
  for (; i < contents.length; i++) {
    const metadata = contents[i].trim();
    if (metadata.length === 0) break;
    const [key, val] = metadata.split(': ');
    metadatas[key] = val;
  }
  const token = contents.slice(++i).join('');

  const data = await verifyJWT(token, jwkCertKey)
  if (data.organizationName) {
    if (data.organizationName === metadatas['Organization Name'] && data.numberOfUsers === metadatas['Number of Users']) {
      return { name: data.organizationName, exp: data.exp };
    }
  } else if (data.individualName) {
    if (data.individualName === metadatas['Individual Name']) {
      return { name: data.individualName, exp: data.exp };
    }
  }
  throw new Error('Invalid')
}
