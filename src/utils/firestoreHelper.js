// utils/firestoreHelper.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  orderBy
} from 'firebase/firestore'
import { db } from '../firebase'

// ============================================
// PROYECTOS
// ============================================

export const getProjects = async (userId) => {
  try {
    const q = query(collection(db, 'projects'))
    const snapshot = await getDocs(q)
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return projects.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0)
      const dateB = b.createdAt?.toDate?.() || new Date(0)
      return dateB - dateA
    })
  } catch (error) {
    console.error('Error al obtener proyectos:', error)
    return []
  }
}

export const subscribeToProjects = (userId, callback) => {
  const q = query(collection(db, 'projects'))

  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    const sorted = projects.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0)
      const dateB = b.createdAt?.toDate?.() || new Date(0)
      return dateB - dateA
    })
    
    callback(sorted)
  })
}

export const addProject = async (projectData) => {
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      createdAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error al agregar proyecto:', error)
    throw error
  }
}

export const updateProject = async (projectId, projectData) => {
  try {
    const projectRef = doc(db, 'projects', projectId)
    await updateDoc(projectRef, projectData)
  } catch (error) {
    console.error('Error al actualizar proyecto:', error)
    throw error
  }
}

export const deleteProject = async (projectId) => {
  try {
    await deleteDoc(doc(db, 'projects', projectId))
  } catch (error) {
    console.error('Error al eliminar proyecto:', error)
    throw error
  }
}

// ============================================
// TAREAS
// ============================================

export const getTasks = async (userId) => {
  try {
    const q = query(collection(db, 'tasks'))
    const snapshot = await getDocs(q)
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return tasks
  } catch (error) {
    console.error('Error al obtener tareas:', error)
    return []
  }
}

export const subscribeToTasks = (userId, callback) => {
  const q = query(collection(db, 'tasks'))

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(tasks)
  })
}

export const addTask = async (taskData) => {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      createdAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error al agregar tarea:', error)
    throw error
  }
}

export const updateTask = async (taskId, taskData) => {
  try {
    const taskRef = doc(db, 'tasks', taskId)
    await updateDoc(taskRef, taskData)
  } catch (error) {
    console.error('Error al actualizar tarea:', error)
    throw error
  }
}

export const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId))
  } catch (error) {
    console.error('Error al eliminar tarea:', error)
    throw error
  }
}

// ============================================
// MIEMBROS
// ============================================

export const getMembers = async (userId) => {
  try {
    const q = query(collection(db, 'teamMembers'))
    const snapshot = await getDocs(q)
    const members = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return members
  } catch (error) {
    console.error('Error al obtener miembros:', error)
    return []
  }
}

export const subscribeToMembers = (userId, callback) => {
  const q = query(collection(db, 'teamMembers'))

  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(members)
  })
}

export const addMember = async (memberData) => {
  try {
    const docRef = await addDoc(collection(db, 'teamMembers'), {
      ...memberData,
      createdAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error al agregar miembro:', error)
    throw error
  }
}

export const updateMember = async (memberId, memberData) => {
  try {
    const memberRef = doc(db, 'teamMembers', memberId)
    await updateDoc(memberRef, memberData)
  } catch (error) {
    console.error('Error al actualizar miembro:', error)
    throw error
  }
}

export const deleteMember = async (memberId) => {
  try {
    await deleteDoc(doc(db, 'teamMembers', memberId))
  } catch (error) {
    console.error('Error al eliminar miembro:', error)
    throw error
  }
}

// ============================================
// ESTADÍSTICAS
// ============================================

export const getTaskCounts = async (userId) => {
  try {
    const q = query(collection(db, 'tasks'))
    const snapshot = await getDocs(q)
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    return {
      todo: tasks.filter(t => t.status === 'todo').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      done: tasks.filter(t => t.status === 'done').length
    }
  } catch (error) {
    console.error('Error al contar tareas:', error)
    return { todo: 0, 'in-progress': 0, review: 0, done: 0 }
  }
}

// ============================================
// MENSAJES
// ============================================

export const subscribeToMessages = (userId, callback) => {
  console.log('🔄 Suscribiéndose a mensajes para usuario:', userId)
  
  const q = query(
    collection(db, 'messages'),
    where('userId', '==', userId),
    orderBy('timestamp', 'asc')
  )
  
  return onSnapshot(q, (snapshot) => {
    console.log('📨 Mensajes recibidos desde Firestore:', snapshot.docs.length)
    
    const conversations = {}
    
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      
      console.log('📩 Procesando mensaje:', {
        id: doc.id,
        sender: data.sender,
        receiver: data.receiver,
        text: data.text
      })
      
      const messageData = {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString()
      }
      
      const currentUserName = data.senderName || data.sender
      const otherUserName = data.receiverName || data.receiver
      
      let contactName
      if (data.senderId === userId) {
        contactName = otherUserName
      } else {
        contactName = currentUserName
      }
      
      console.log('👥 Conversación con:', contactName)
      
      if (!conversations[contactName]) {
        conversations[contactName] = []
      }
      
      conversations[contactName].push(messageData)
    })
    
    console.log('📊 Conversaciones organizadas:', {
      cantidad: Object.keys(conversations).length,
      contactos: Object.keys(conversations)
    })
    
    callback(conversations)
  }, (error) => {
    console.error('❌ Error en suscripción de mensajes:', error)
  })
}

export const sendMessage = async (messageData, senderId) => {
  try {
    const membersSnapshot = await getDocs(collection(db, 'teamMembers'))
    const receiver = membersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .find(m => m.name === messageData.receiverName)

    if (!receiver) {
      console.error('❌ No se encontró el receptor:', messageData.receiverName)
      throw new Error(`No se encontró el contacto "${messageData.receiverName}"`)
    }

    if (!receiver.userId) {
      console.error('❌ El receptor no tiene userId:', receiver)
      throw new Error(`⚠️ El contacto "${messageData.receiverName}" no tiene un email de usuario asociado.\n\nPara poder enviar mensajes:\n1. Ve a la vista "Equipo"\n2. Edita este miembro\n3. Agrega su email de usuario registrado en el campo "Email de Usuario Registrado"`)
    }

    const receiverUserId = receiver.userId

    const baseMessage = {
      sender: messageData.sender || messageData.senderName || '',
      receiver: messageData.receiver || messageData.receiverName || '',
      text: messageData.text || '',
      timestamp: messageData.timestamp || new Date(),
      read: false,
      senderId: senderId,
      receiverId: receiverUserId,
      senderName: messageData.senderName || messageData.sender || '',
      receiverName: messageData.receiverName || messageData.receiver || ''
    }

    if (messageData.taskReference && messageData.taskReference.id) {
      baseMessage.taskReference = {
        id: messageData.taskReference.id || '',
        title: messageData.taskReference.title || '',
        status: messageData.taskReference.status || '',
        priority: messageData.taskReference.priority || ''
      }
    }

    const senderMessage = {
      ...baseMessage,
      userId: senderId
    }

    const receiverMessage = {
      ...baseMessage,
      userId: receiverUserId
    }

    console.log('💾 Guardando mensaje para emisor:', senderMessage)
    console.log('💾 Guardando mensaje para receptor:', receiverMessage)

    const senderDoc = await addDoc(collection(db, 'messages'), senderMessage)
    const receiverDoc = await addDoc(collection(db, 'messages'), receiverMessage)
    
    console.log('✅ Mensaje guardado - Emisor ID:', senderDoc.id)
    console.log('✅ Mensaje guardado - Receptor ID:', receiverDoc.id)
    
    return senderDoc.id
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error)
    throw error
  }
}

// ============================================
// MARCAR MENSAJES COMO LEÍDOS
// ============================================

export const markMessagesAsRead = async (userId, contactName) => {
  try {
    console.log('📖 Marcando mensajes como leídos:', { userId, contactName })
    
    // Buscar mensajes del contacto que son para el usuario actual y no están leídos
    const q = query(
      collection(db, 'messages'),
      where('userId', '==', userId),
      where('senderName', '==', contactName),
      where('read', '==', false)
    )
    
    const snapshot = await getDocs(q)
    console.log(`📝 Encontrados ${snapshot.docs.length} mensajes sin leer de ${contactName}`)
    
    // Marcar cada mensaje como leído
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    )
    
    await Promise.all(updatePromises)
    console.log(`✅ Mensajes marcados como leídos`)
    
    return snapshot.docs.length
  } catch (error) {
    console.error('❌ Error al marcar mensajes como leídos:', error)
    throw error
  }
}
