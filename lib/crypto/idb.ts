// handles three thind majorly ..opendb(),saveKey(),loadPrivateKey(),a dn clear key


const DB_NAME="secure-chat-keys"
const DB_VERSION=1
const STORE_NAME="keys"




function openDB():Promise<IDBDatabase>
{
    return new Promise((resolve,reject)=>{
        const request =indexedDB.open(DB_NAME,DB_VERSION)

        request.onupgradeneeded=(event)=>{
            const db =(event.target as IDBOpenDBRequest).result
            // opens (or creates) the IndexedDB database
// creates the "keys" object store if it doesn't exist

            if(!db.objectStoreNames.contains(STORE_NAME))
            {
                db.createObjectStore(STORE_NAME,{keyPath:"id"})
            }
        }

        request.onsuccess=(event)=>{
            resolve((event.target as IDBOpenDBRequest).result)
        }
        
        request.onerror=(event)=>{
            reject((event.target as IDBOpenDBRequest).error)
        }


    })    
}


export async function saveKeys(
    privateKey: CryptoKey, 
    publicKey: CryptoKey
):Promise<void>{
    const db = await openDB()

  return new Promise((resolve, reject) => {

    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
//stores both CryptoKey objects in the "keys" store

    store.put({ id: "privateKey", value: privateKey })
    store.put({ id: "publicKey", value: publicKey })

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

    
}

export async function loadPrivateKey(): Promise<CryptoKey | null> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
//  retrieves the private key from IndexedDB

    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const request = store.get("privateKey")

// called when the user opens a chat and needs to decrypt/encrypt

    request.onsuccess = () => {
      const record = request.result
      resolve(record ? record.value : null)
    }

    request.onerror = () => reject(request.error)
  })
}


export async function clearKeys(): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)

    store.delete("privateKey")
    store.delete("publicKey")

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}