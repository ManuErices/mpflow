import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase'

// ===== PROYECTOS =====

export const getProjects = async (userId) => {
  const q = query(
    collection(db, 'projects'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const addProject = async (userId, projectData) => {
  const docRef = await addDoc(collection(db, 'projects'), {
    ...projectData,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  return docRef.id
}

export const updateProject = async (projectId, projectData) => {
  const docRef = doc(db, 'projects', projectId)
  await updateDoc(docRef, {
    ...projectData,
    updatedAt: new Date().toISOString()
  })
}

export const deleteProject = async (projectId) => {
  await deleteDoc(doc(db, 'projects', projectId))
}

// ===== TAREAS =====

export const getTasks = async (userId) => {
  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const addTask = async (userId, taskData) => {
  const docRef = await addDoc(collection(db, 'tasks'), {
    ...taskData,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  return docRef.id
}

export const updateTask = async (taskId, taskData) => {
  const docRef = doc(db, 'tasks', taskId)
  await updateDoc(docRef, {
    ...taskData,
    updatedAt: new Date().toISOString()
  })
}

export const deleteTask = async (taskId) => {
  await deleteDoc(doc(db, 'tasks', taskId))
}

// ===== MIEMBROS =====

export const getMembers = async (userId) => {
  const q = query(
    collection(db, 'members'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const addMember = async (userId, memberData) => {
  const docRef = await addDoc(collection(db, 'members'), {
    ...memberData,
    userId,
    createdAt: new Date().toISOString()
  })
  return docRef.id
}

export const updateMember = async (memberId, memberData) => {
  const docRef = doc(db, 'members', memberId)
  await updateDoc(docRef, memberData)
}

export const deleteMember = async (memberId) => {
  await deleteDoc(doc(db, 'members', memberId))
}

// ===== LISTENERS EN TIEMPO REAL =====

export const subscribeToProjects = (userId, callback) => {
  const q = query(
    collection(db, 'projects'),
    where('userId', '==', userId)
  )
  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(projects)
  })
}

export const subscribeToTasks = (userId, callback) => {
  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', userId)
  )
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(tasks)
  })
}

export const subscribeToMembers = (userId, callback) => {
  const q = query(
    collection(db, 'members'),
    where('userId', '==', userId)
  )
  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(members)
  })
}
