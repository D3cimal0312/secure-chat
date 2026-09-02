import { saveKeys } from "./idb";
import { bufferToBase64, base64ToBuffer } from "./utils"


// generating ecdh keypair using p256 and save to indexdb amd return pubilc key as base64(goes to server)

export async function generateKeyPair(): Promise<string>{
    const keypair = await crypto.subtle.generateKey({
        name:"ECDH",
        namedCurve:"P-256"
    },false,["deriveKey"]) //false makes the private key non extractable js cant read it


   const exportedPublicKey = await crypto.subtle.exportKey("spki",keypair.publicKey)

   const publicKeyBase64 = bufferToBase64(exportedPublicKey)

   await saveKeys(keypair.privateKey,keypair.publicKey)

   return publicKeyBase64


}

// importing another users public key from base64 string back to crypto key

export async function importPublicKey(base64:string): Promise<CryptoKey>{
const buffer =base64ToBuffer(base64)

return crypto.subtle.importKey("spki",buffer,{
    name:"ECDH",
    namedCurve:"P-256"
},false,[]) //[] public ecdh have no direct use so empty array 
}


//deriving the shared aec-dcm key using both private(A) and public keys(B)
export async function deriveSharedSecret(
  privateKey: CryptoKey,
  otherPublicKeyBase64: string
): Promise<CryptoKey> {
  const otherPublicKey = await importPublicKey(otherPublicKeyBase64)

  return crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: otherPublicKey, 
    },
    privateKey,               
    {
      name: "AES-GCM",       
      length: 256,          
    },
    false,                    
    ["encrypt", "decrypt"]    // key will be used to encrypt and decrypt
  )
}