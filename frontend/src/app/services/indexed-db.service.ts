import { Injectable } from '@angular/core'

/** オブジェクトストア定義（open 時に未存在なら作成） */
export interface IndexedDBStoreSchema {
  name: string
  keyPath?: string | string[]
  autoIncrement?: boolean
  indexes?: { name: string; keyPath: string | string[]; unique?: boolean }[]
}

/**
 * IndexedDB の薄いラッパー。
 * オフライン保存（20.4 以降）で OfflineStorageService から利用する。
 */
@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {
  private db: IDBDatabase | null = null
  private dbName: string | null = null

  /**
   * DB を開く。既に同名で開いていれば何もしない。
   * スキーマで指定したストアが無い場合は作成する。
   */
  async open(
    dbName: string,
    version: number,
    storeSchemas: IndexedDBStoreSchema[]
  ): Promise<void> {
    if (this.db && this.dbName === dbName) return

    return new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName, version)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => {
        this.db = req.result
        this.dbName = dbName
        resolve()
      }
      req.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        for (const schema of storeSchemas) {
          if (!db.objectStoreNames.contains(schema.name)) {
            const store = db.createObjectStore(schema.name, {
              keyPath: schema.keyPath,
              autoIncrement: schema.autoIncrement ?? false
            })
            for (const idx of schema.indexes ?? []) {
              store.createIndex(idx.name, idx.keyPath, { unique: idx.unique ?? false })
            }
          }
        }
      }
    })
  }

  /** 開いている DB を閉じる */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.dbName = null
    }
  }

  private assertOpen(): IDBDatabase {
    if (!this.db) throw new Error('IndexedDB is not open. Call open() first.')
    return this.db
  }

  /** トランザクションでストアを取得（readonly） */
  get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const db = this.assertOpen()
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const req = store.get(key)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve(req.result as T | undefined)
    })
  }

  /** トランザクションでストアに put */
  put(storeName: string, value: unknown, key?: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.assertOpen()
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const req = key !== undefined ? store.put(value, key) : store.put(value)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve()
    })
  }

  /** トランザクションでストアから delete */
  delete(storeName: string, key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.assertOpen()
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const req = store.delete(key)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve()
    })
  }

  /** ストア内の全件取得 */
  getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const db = this.assertOpen()
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const req = store.getAll()
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve((req.result ?? []) as T[])
    })
  }

  /** ストアを空にする */
  clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.assertOpen()
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const req = store.clear()
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve()
    })
  }
}
