// recurringTasksHelper.js
// Sistema para generar automáticamente tareas recurrentes

import { addTask, getTasks } from './firestoreHelper'

/**
 * Verifica y genera tareas recurrentes que deben crearse
 * @param {string} userId - ID del usuario
 * @param {Array} tasks - Todas las tareas actuales
 * @returns {Promise<number>} - Número de tareas creadas
 */
export const checkAndGenerateRecurringTasks = async (userId, tasks) => {
  try {
    console.log('🔄 Verificando tareas recurrentes...')
    
    const today = new Date()
    const currentMonth = today.getMonth() // 0-11
    const currentYear = today.getFullYear()
    const currentDay = today.getDate()
    
    // Obtener todas las tareas recurrentes activas
    const recurringTasks = tasks.filter(task => 
      task.isRecurring && 
      task.recurrence?.enabled
    )
    
    console.log(`📋 Encontradas ${recurringTasks.length} tareas recurrentes`)
    
    let tasksCreated = 0
    
    for (const template of recurringTasks) {
      const { recurrence } = template
      
      // Verificar si hoy es el día de generar la tarea
      if (currentDay !== recurrence.dayOfMonth) {
        continue // No es el día correcto
      }
      
      // Calcular la fecha de vencimiento (hoy + hora)
      const dueDate = new Date(currentYear, currentMonth, currentDay)
      const dueDateString = dueDate.toISOString().split('T')[0]
      
      // Verificar si ya existe una tarea para este mes
      const existingTask = tasks.find(task => 
        task.recurringTemplateId === template.id &&
        task.dueDate === dueDateString
      )
      
      if (existingTask) {
        console.log(`⏭️  Ya existe tarea para: ${template.title} en ${dueDateString}`)
        continue
      }
      
      // Crear la nueva tarea
      const newTask = {
        title: template.title,
        description: template.description,
        priority: template.priority,
        assignees: template.assignees || [],
        assignee: template.assignees?.[0] || '',
        dueDate: dueDateString,
        dueTime: template.dueTime,
        tags: [...(template.tags || []), '🔁 Recurrente'],
        projectId: template.projectId,
        status: 'todo',
        checklist: template.checklist || { items: [], completed: 0, total: 0 },
        attachments: [],
        requestedBy: template.requestedBy,
        requestedById: template.requestedById,
        isRecurring: false, // La tarea generada NO es recurrente
        recurringTemplateId: template.id, // Referencia a la plantilla
        generatedFrom: template.id,
        generatedAt: new Date().toISOString()
      }
      
      await addTask(newTask)
      tasksCreated++
      
      console.log(`✅ Tarea creada: ${template.title} para ${dueDateString}`)
    }
    
    if (tasksCreated > 0) {
      console.log(`🎉 Se crearon ${tasksCreated} tareas recurrentes`)
    } else {
      console.log('✓ No hay tareas recurrentes para generar hoy')
    }
    
    return tasksCreated
    
  } catch (error) {
    console.error('❌ Error al generar tareas recurrentes:', error)
    return 0
  }
}

/**
 * Obtener el próximo mes en que se generará una tarea recurrente
 * @param {Object} recurrence - Configuración de recurrencia
 * @returns {Date} - Fecha del próximo evento
 */
export const getNextOccurrence = (recurrence) => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const currentDay = today.getDate()
  
  let nextMonth = currentMonth
  let nextYear = currentYear
  
  // Si ya pasó el día este mes, ir al próximo
  if (currentDay > recurrence.dayOfMonth) {
    nextMonth += recurrence.monthsInterval
  }
  
  // Ajustar año si es necesario
  if (nextMonth > 11) {
    nextYear++
    nextMonth = nextMonth - 12
  }
  
  return new Date(nextYear, nextMonth, recurrence.dayOfMonth)
}

/**
 * Formatear la próxima ocurrencia para mostrar al usuario
 * @param {Object} recurrence - Configuración de recurrencia
 * @returns {string} - Texto formateado
 */
export const formatNextOccurrence = (recurrence) => {
  const next = getNextOccurrence(recurrence)
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return next.toLocaleDateString('es-ES', options)
}

/**
 * Validar configuración de recurrencia
 * @param {Object} recurrence - Configuración de recurrencia
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateRecurrence = (recurrence) => {
  const errors = []
  
  if (!recurrence.dayOfMonth || recurrence.dayOfMonth < 1 || recurrence.dayOfMonth > 31) {
    errors.push('El día del mes debe estar entre 1 y 31')
  }
  
  if (!recurrence.monthsInterval || recurrence.monthsInterval < 1 || recurrence.monthsInterval > 12) {
    errors.push('El intervalo debe estar entre 1 y 12 meses')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
