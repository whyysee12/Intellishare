
export const generateKey = async (): Promise<CryptoKey> => {
  return window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

export const encrypt = async (text: string, key: CryptoKey) => {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );
  
  // Convert to Base64 for easier display/transport simulation
  const ivArr = Array.from(iv);
  const dataArr = Array.from(new Uint8Array(ciphertext));
  
  return {
    iv: ivArr,
    data: dataArr,
    // Helper to visualize
    toString: () => `[AES-GCM-256] IV:${btoa(String.fromCharCode(...ivArr)).substr(0,8)}... Payload:${btoa(String.fromCharCode(...dataArr)).substr(0, 16)}...`
  };
};

export const decrypt = async (encrypted: { iv: number[], data: number[] }, key: CryptoKey) => {
  try {
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(encrypted.iv) },
      key,
      new Uint8Array(encrypted.data)
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error("Decryption failed", e);
    return "**************"; // Failed to decrypt
  }
};
