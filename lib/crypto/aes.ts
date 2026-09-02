

import {bufferToBase64,base64ToBuffer} from "./utils"

// excrypt a plain text with shred secret //
//  generates a fresh random IV per message  and saved with the cipher text stoerd  in DB 12 Bytes=96 bits//

export async function encrypt (
    plaintext:string,
    sharedSecret:CryptoKey
):Promise<{ciphertext:string,iv:string}>{


    const encoder =new TextEncoder();
    const encodedText =  encoder.encode(plaintext);

    const iv=crypto.getRandomValues(new Uint8Array(12))

    const encryptedBuffer =await crypto.subtle.encrypt({
        name:"AES-GCM",
        iv:iv
    },
    sharedSecret,
    encodedText)

const ciphertextBase64 = bufferToBase64(encryptedBuffer);
const ivBase64 = bufferToBase64(iv.buffer);

return { ciphertext: ciphertextBase64, iv: ivBase64 }


}



// decrypt function 

// decrypte a ciphertext using aes gcm with the given shared secret and iv
// throws if the ciphertext was tampered with or the wrong key/iv is used  aes gcm authentication handles this automatically

export async function decrypt(
    ciphertextBase64:string,
    ivBase64:string,
    sharedSecret:CryptoKey
):Promise<string>{
    const ciphertext =base64ToBuffer(ciphertextBase64)
    const iv =base64ToBuffer(ivBase64)

    const decoder = new TextDecoder();

    const decryptedBuffer = await crypto.subtle.decrypt({
        name:"AES-GCM",
        iv:iv
    },
    sharedSecret,
    ciphertext)
    return decoder.decode(decryptedBuffer)
}