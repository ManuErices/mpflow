// presenceHelper.js
// Sistema de presencia online/offline en tiempo real

import { db } from '../firebase'
import { ref as dbRef, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database'
import { getDatabase } from 'firebase/database'

/**
 * Inicializar presencia del usuario
 * @param {string} userId - ID del usuario
 * @param {string} userName - Nombre del usuario
 */
export const initializePresence = (userId, userName) => {
  if (!userId) return null

  const database = getDatabase()
  const userStatusRef = dbRef(database, `status/${userId}`)

  // Estado online
  const isOnlineData = {
    state: 'online',
    lastChanged: serverTimestamp(),
    userName: userName
  }

  // Estado offline
  const isOfflineData = {
    state: 'offline',
    lastChanged: serverTimestamp(),
    userName: userName
  }

  // Configurar para marcar como offline cuando se desconecte
  onDisconnect(userStatusRef).set(isOfflineData)

  // Marcar como online
  set(userStatusRef, isOnlineData)

  console.log(`🟢 Presencia inicializada para: ${userName}`)

  return userStatusRef
}

/**
 * Suscribirse a cambios de presencia de todos los usuarios
 * @param {Function} callback - Función que recibe el objeto de presencias
 * @returns {Function} - Función para desuscribirse
 */
export const subscribeToPresence = (callback) => {
  const database = getDatabase()
  const presenceRef = dbRef(database, 'status')

  const unsubscribe = onValue(presenceRef, (snapshot) => {
    const presences = {}
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      
      // Convertir a objeto más manejable
      Object.keys(data).forEach(userId => {
        const userStatus = data[userId]
        presences[userId] = {
          state: userStatus.state,
          lastChanged: userStatus.lastChanged,
          userName: userStatus.userName
        }
      })
    }
    
    callback(presences)
  })

  return unsubscribe
}

/**
 * Obtener estado de un usuario específico por su nombre
 * @param {Object} presences - Objeto de presencias
 * @param {string} userName - Nombre del usuario
 * @returns {string} - 'online' o 'offline'
 */
export const getUserStatus = (presences, userName) => {
  if (!presences || !userName) return 'offline'
  
  // Buscar el usuario por nombre
  const userEntry = Object.values(presences).find(
    presence => presence.userName === userName
  )
  
  return userEntry?.state || 'offline'
}

/**
 * Limpiar presencia del usuario al cerrar sesión
 * @param {string} userId - ID del usuario
 */
export const cleanupPresence = async (userId) => {
  if (!userId) return

  const database = getDatabase()
  const userStatusRef = dbRef(database, `status/${userId}`)

  try {
    await set(userStatusRef, {
      state: 'offline',
      lastChanged: serverTimestamp()
    })
    console.log('🔴 Presencia limpiada')
  } catch (error) {
    console.error('Error al limpiar presencia:', error)
  }
}

/**
 * Contar usuarios online
 * @param {Object} presences - Objeto de presencias
 * @returns {number} - Cantidad de usuarios online
 */
export const getOnlineCount = (presences) => {
  if (!presences) return 0
  
  return Object.values(presences).filter(
    presence => presence.state === 'online'
  ).length
}

/**
 * Obtener lista de usuarios online
 * @param {Object} presences - Objeto de presencias
 * @returns {Array} - Array de nombres de usuarios online
 */
export const getOnlineUsers = (presences) => {
  if (!presences) return []
  
  return Object.values(presences)
    .filter(presence => presence.state === 'online')
    .map(presence => presence.userName)
}
