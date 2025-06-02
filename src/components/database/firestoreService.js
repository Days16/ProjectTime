// src/database/firestoreService.js
import { db } from "../auth/firebase"
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore"

export const saveHistoryEntry = async (uid, entry) => {
  try {
    const userHistoryRef = collection(db, "users", uid, "history")
    await addDoc(userHistoryRef, {
      ...entry,
      createdAt: new Date()
    })
  } catch (err) {
    console.error("Error saving history entry:", err)
  }
}

export const getUserHistory = async (uid) => {
  try {
    const userHistoryRef = collection(db, "users", uid, "history")
    const q = query(userHistoryRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error("Error getting user history:", err)
    return []
  }
}
