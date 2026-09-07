import { encrypt, decrypt } from "./aes";
import { bufferToBase64, base64ToBuffer } from "./utils";

export interface EncryptedBody {
  ciphertext: string;
  iv: string;
}

export interface Envelope {
  recipientId: string;
  keyCiphertext: string;
  keyIv: string;
}

export async function generateMessageKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function buildEnvelope(
  messageKey: CryptoKey,
  recipientId: string,
  recipientSecret: CryptoKey
): Promise<Envelope> {
  const raw = await crypto.subtle.exportKey("raw", messageKey);
  const keyBytes = bufferToBase64(raw);
  const { ciphertext, iv } = await encrypt(keyBytes, recipientSecret);
  return { recipientId, keyCiphertext: ciphertext, keyIv: iv };
}

export async function openEnvelope(
  envelope: Envelope,
  recipientSecret: CryptoKey
): Promise<CryptoKey> {
  const rawKeyBase64 = await decrypt(
    envelope.keyCiphertext,
    envelope.keyIv,
    recipientSecret
  );
  const raw = base64ToBuffer(rawKeyBase64);
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}