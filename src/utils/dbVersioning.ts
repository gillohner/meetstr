// src/utils/dbVersioning.ts
import { openDB } from 'idb';

export const initializeDB = async (dbName: string) => {
    return openDB(dbName, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('queries')) {
          db.createObjectStore('queries')
        }
      }
    })
}  
