// notificationsHelper.js
// Sistema de notificaciones de escritorio para tareas pendientes

/**
 * Solicitar permiso para mostrar notificaciones
 * @returns {Promise<boolean>} - true si se otorgó permiso
 */
export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.warn('❌ Este navegador no soporta notificaciones de escritorio')
      return false
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Permisos de notificación ya otorgados')
      return true
    }

    if (Notification.permission === 'denied') {
      console.warn('⛔ Permisos de notificación denegados por el usuario')
      return false
    }

    // Solicitar permiso
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      console.log('✅ Permisos de notificación otorgados')
      
      // Mostrar notificación de bienvenida
      showNotification('MPFlow', {
        body: '¡Notificaciones activadas! Te avisaremos sobre tus tareas pendientes.',
        icon: '/favicon.ico',
        tag: 'welcome'
      })
      
      return true
    }
    
    return false
    
  } catch (error) {
    console.error('❌ Error al solicitar permisos de notificación:', error)
    return false
  }
}

/**
 * Mostrar una notificación de escritorio
 * @param {string} title - Título de la notificación
 * @param {Object} options - Opciones de la notificación
 */
export const showNotification = (title, options = {}) => {
  try {
    if (Notification.permission !== 'granted') {
      console.warn('⚠️ No hay permisos para mostrar notificaciones')
      return null
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      requireInteraction: false, // No requiere interacción para cerrarse
      ...options
    }

    const notification = new Notification(title, defaultOptions)

    // Auto-cerrar después de 10 segundos
    setTimeout(() => {
      notification.close()
    }, 10000)

    // Click handler - enfocar la ventana
    notification.onclick = function(event) {
      event.preventDefault()
      window.focus()
      notification.close()
    }

    return notification
    
  } catch (error) {
    console.error('❌ Error al mostrar notificación:', error)
    return null
  }
}

/**
 * Obtener tareas pendientes para hoy del usuario actual
 * @param {Array} allTasks - Todas las tareas
 * @param {string} currentUserName - Nombre del usuario actual
 * @returns {Array} - Tareas pendientes para hoy
 */
export const getTodayPendingTasks = (allTasks, currentUserName) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayString = today.toISOString().split('T')[0]
  
  return allTasks.filter(task => {
    // Solo tareas no completadas
    if (task.status === 'done') return false
    
    // Solo tareas asignadas al usuario actual
    const isAssigned = 
      task.assignees?.includes(currentUserName) || 
      task.assignee === currentUserName
    if (!isAssigned) return false
    
    // Con fecha de hoy
    if (!task.dueDate) return false
    
    const taskDate = task.dueDate
    return taskDate === todayString
  })
}

/**
 * Obtener tareas vencidas del usuario actual
 * @param {Array} allTasks - Todas las tareas
 * @param {string} currentUserName - Nombre del usuario actual
 * @returns {Array} - Tareas vencidas
 */
export const getOverdueTasks = (allTasks, currentUserName) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return allTasks.filter(task => {
    // Solo tareas no completadas
    if (task.status === 'done') return false
    
    // Solo tareas asignadas al usuario actual
    const isAssigned = 
      task.assignees?.includes(currentUserName) || 
      task.assignee === currentUserName
    if (!isAssigned) return false
    
    // Con fecha anterior a hoy
    if (!task.dueDate) return false
    
    const taskDate = new Date(task.dueDate)
    taskDate.setHours(0, 0, 0, 0)
    
    return taskDate < today
  })
}

/**
 * Notificar sobre tareas pendientes para hoy
 * @param {Array} allTasks - Todas las tareas
 * @param {string} currentUserName - Nombre del usuario actual
 */
export const notifyTodayTasks = (allTasks, currentUserName) => {
  if (Notification.permission !== 'granted') return
  
  const todayTasks = getTodayPendingTasks(allTasks, currentUserName)
  const overdueTasks = getOverdueTasks(allTasks, currentUserName)
  
  if (todayTasks.length === 0 && overdueTasks.length === 0) {
    console.log('✓ No hay tareas pendientes para notificar')
    return
  }
  
  let body = ''
  let icon = '/favicon.ico'
  
  if (overdueTasks.length > 0 && todayTasks.length > 0) {
    // Ambas
    body = `⚠️ ${overdueTasks.length} vencida${overdueTasks.length > 1 ? 's' : ''} y ${todayTasks.length} para hoy`
    icon = '⚠️'
  } else if (overdueTasks.length > 0) {
    // Solo vencidas
    body = `⚠️ Tienes ${overdueTasks.length} tarea${overdueTasks.length > 1 ? 's' : ''} vencida${overdueTasks.length > 1 ? 's' : ''}`
    icon = '⚠️'
  } else {
    // Solo hoy
    body = `📅 Tienes ${todayTasks.length} tarea${todayTasks.length > 1 ? 's' : ''} pendiente${todayTasks.length > 1 ? 's' : ''} para hoy`
    icon = '📅'
  }
  
  showNotification('MPFlow - Recordatorio de Tareas', {
    body: body,
    icon: icon,
    tag: 'daily-tasks',
    requireInteraction: true // Requiere que el usuario cierre la notificación
  })
  
  console.log(`🔔 Notificación enviada: ${body}`)
}

/**
 * Verificar si ya se notificó hoy
 * @returns {boolean}
 */
export const hasNotifiedToday = () => {
  const lastNotification = localStorage.getItem('mpflow_last_notification')
  if (!lastNotification) return false
  
  const lastDate = new Date(lastNotification)
  const today = new Date()
  
  return (
    lastDate.getDate() === today.getDate() &&
    lastDate.getMonth() === today.getMonth() &&
    lastDate.getFullYear() === today.getFullYear()
  )
}

/**
 * Marcar que ya se notificó hoy
 */
export const markAsNotifiedToday = () => {
  localStorage.setItem('mpflow_last_notification', new Date().toISOString())
}

/**
 * Configurar notificaciones automáticas
 * @param {Array} allTasks - Todas las tareas
 * @param {string} currentUserName - Nombre del usuario actual
 * @returns {Object} - Interval IDs para limpiar después
 */
export const setupAutomaticNotifications = (allTasks, currentUserName) => {
  console.log('🔔 Configurando notificaciones automáticas...')
  
  // Notificar inmediatamente si no se ha notificado hoy
  if (!hasNotifiedToday()) {
    setTimeout(() => {
      notifyTodayTasks(allTasks, currentUserName)
      markAsNotifiedToday()
    }, 5000) // Esperar 5 segundos después de cargar
  }
  
  // Notificar cada 4 horas (14400000 ms)
  const reminderInterval = setInterval(() => {
    notifyTodayTasks(allTasks, currentUserName)
  }, 4 * 60 * 60 * 1000)
  
  // Verificar a las 9:00 AM cada día
  const checkMorningNotification = () => {
    const now = new Date()
    const hour = now.getHours()
    
    if (hour === 9 && !hasNotifiedToday()) {
      notifyTodayTasks(allTasks, currentUserName)
      markAsNotifiedToday()
    }
  }
  
  // Verificar cada hora si es momento de notificar
  const morningCheckInterval = setInterval(checkMorningNotification, 60 * 60 * 1000)
  
  console.log('✅ Notificaciones automáticas configuradas')
  
  return {
    reminderInterval,
    morningCheckInterval
  }
}

/**
 * Limpiar notificaciones automáticas
 * @param {Object} intervals - Objeto con los interval IDs
 */
export const cleanupNotifications = (intervals) => {
  if (intervals?.reminderInterval) {
    clearInterval(intervals.reminderInterval)
  }
  if (intervals?.morningCheckInterval) {
    clearInterval(intervals.morningCheckInterval)
  }
  console.log('🧹 Notificaciones automáticas limpiadas')
}
