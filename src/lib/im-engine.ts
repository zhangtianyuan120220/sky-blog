// ----------------------------------------------------
// 1. DFA (确定性有限自动机) 敏词过滤引擎
// ----------------------------------------------------
class DFACensor {
  private root: Map<string, any> = new Map();

  constructor(words: string[] = ['敏感词', '违禁词', '赌博', '色情', '诈骗']) {
    this.addWords(words);
  }

  public addWords(words: string[]) {
    for (const word of words) {
      let node = this.root;
      for (const char of word) {
        if (!node.has(char)) {
          node.set(char, new Map());
        }
        node = node.get(char);
      }
      node.set('isEnd', true);
    }
  }

  public filter(text: string, replacement: string = '***'): string {
    let result = '';
    let i = 0;

    while (i < text.length) {
      let node = this.root;
      let matchLen = 0;
      let tempLen = 0;

      for (let j = i; j < text.length; j++) {
        const char = text[j];
        if (!node.has(char)) break;
        node = node.get(char);
        tempLen++;
        if (node.get('isEnd')) {
          matchLen = tempLen;
        }
      }

      if (matchLen > 0) {
        result += replacement;
        i += matchLen;
      } else {
        result += text[i];
        i++;
      }
    }

    return result;
  }
}

export const censorEngine = new DFACensor();

// ----------------------------------------------------
// 2. Web Crypto API AES-GCM 端到端加密 (E2EE) 模块
// ----------------------------------------------------
export async function generateCryptoKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptMessage(text: string, rawSecretKey: string): Promise<{ ciphertext: string; iv: string }> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(rawSecretKey.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    enc.encode(text)
  );

  return {
    ciphertext: Buffer.from(encrypted).toString('base64'),
    iv: Buffer.from(iv).toString('base64')
  };
}

export async function decryptMessage(ciphertext: string, ivBase64: string, rawSecretKey: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(rawSecretKey.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const iv = new Uint8Array(Buffer.from(ivBase64, 'base64'));
    const data = new Uint8Array(Buffer.from(ciphertext, 'base64'));

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    return '[消息解密失败]';
  }
}