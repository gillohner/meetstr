// src/utils/persister.ts
import { openDB, IDBPDatabase } from 'idb';

const DB_VERSION = 1;

export const createIDBPersister = (dbName: string) => ({
  async persistClient(client: any) {
    const db = await openDB(dbName, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('queries')) {
          db.createObjectStore('queries');
        }
      }
    });
    const tx = db.transaction('queries', 'readwrite');
    await tx.store.put(client, 'queries');
    await tx.done;
  },

  async restoreClient() {
    const db = await openDB(dbName, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('queries')) {
          db.createObjectStore('queries');
        }
      }
    });
    const tx = db.transaction('queries');
    return tx.store.get('queries');
  },

  async removeClient() {
    const db = await openDB(dbName, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('queries')) {
          db.createObjectStore('queries');
        }
      }
    });
    const tx = db.transaction('queries', 'readwrite');
    await tx.store.delete('queries');
    await tx.done;
  }
});
