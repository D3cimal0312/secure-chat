//converting array buffer to base 64 string for sending over network /storing in db
export function bufferToBase64(buffer: ArrayBuffer): string {


    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}


// converting base 64 string back to array buffer for using iwht webcrypto api

export function base64ToBuffer(base64: string): ArrayBuffer{
    const binary =atob(base64)

const bytes=new Uint8Array(binary.length)
for (let i=0;i<binary.length;i++){
    bytes[i]=binary.charCodeAt(i)
}
return bytes.buffer;
}
