import { openDB } from "idb"

const DB_NAME = "hourTrackerDB"
const DB_VERSION = 1

const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("history")) {
        db.createObjectStore("history", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("projects")) {
        db.createObjectStore("projects", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("syncQueue")) {
        db.createObjectStore("syncQueue", { keyPath: "id" })
      }
    }
  })
}

export const cacheService = {
  async saveHistory(history) {
    const db = await initDB()
    const tx = db.transaction("history", "readwrite")
    const store = tx.objectStore("history")
    await Promise.all(history.map(item => store.put(item)))
    await tx.done
  },

  async getHistory() {
    const db = await initDB()
    const tx = db.transaction("history", "readonly")
    const store = tx.objectStore("history")
    return store.getAll()
  },

  async saveProjects(projects) {
    const db = await initDB()
    const tx = db.transaction("projects", "readwrite")
    const store = tx.objectStore("projects")
    await Promise.all(projects.map(project => store.put(project)))
    await tx.done
  },

  async getProjects() {
    const db = await initDB()
    const tx = db.transaction("projects", "readonly")
    const store = tx.objectStore("projects")
    return store.getAll()
  },

  async addToSyncQueue(operation) {
    const db = await initDB()
    const tx = db.transaction("syncQueue", "readwrite")
    const store = tx.objectStore("syncQueue")
    await store.put({
      id: Date.now(),
      ...operation,
      timestamp: new Date().toISOString()
    })
    await tx.done
  },

  async getSyncQueue() {
    const db = await initDB()
    const tx = db.transaction("syncQueue", "readonly")
    const store = tx.objectStore("syncQueue")
    return store.getAll()
  },

  async clearSyncQueue() {
    const db = await initDB()
    const tx = db.transaction("syncQueue", "readwrite")
    const store = tx.objectStore("syncQueue")
    await store.clear()
    await tx.done
  }
} 