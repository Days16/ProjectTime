// src/database/firestoreService.js
import { db } from "../config/firebase"
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore"

// Guarda una entrada de historial con nombre de proyecto, fecha y tiempo trabajado
export const saveHistoryEntry = async (uid, entry) => {
  try {
    const userHistoryRef = collection(db, "users", uid, "history")
    await addDoc(userHistoryRef, {
      ...entry,
      createdAt: new Date()
    })
  } catch (err) {
    console.error("Error saving history entry:", err)
    throw err
  }
}

// Obtiene todo el historial del usuario, ordenado por fecha
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

// Actualiza una entrada del historial
export const updateHistoryEntry = async (uid, entryId, entry) => {
  try {
    const entryRef = doc(db, "users", uid, "history", entryId)
    await updateDoc(entryRef, {
      ...entry,
      updatedAt: new Date()
    })
  } catch (err) {
    console.error("Error updating history entry:", err)
    throw err
  }
}

// Elimina una entrada del historial
export const deleteHistoryEntry = async (uid, entryId) => {
  try {
    const entryRef = doc(db, "users", uid, "history", entryId)
    await deleteDoc(entryRef)
  } catch (err) {
    console.error("Error deleting history entry:", err)
    throw err
  }
}

// Filtra el historial por nombre de proyecto
export const getUserHistoryByProject = async (uid, projectName) => {
  try {
    const userHistoryRef = collection(db, "users", uid, "history")
    const q = query(
      userHistoryRef,
      where("project", "==", projectName),
      orderBy("createdAt", "desc")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error("Error getting history by project:", err)
    return []
  }
}
