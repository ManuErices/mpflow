import { Repeat, Edit2, Trash2, Calendar, Clock, Users, AlertCircle } from 'lucide-react'
import { formatNextOccurrence } from '../utils/recurringTasksHelper'

function RecurringTasksPanel({ tasks, onEdit, onDelete, onClose }) {
  // Filtrar solo tareas recurrentes
  const recurringTasks = tasks.filter(task => task.isRecurring && task.recurrence?.enabled)

  const getRecurrenceText = (recurrence) => {
    const { dayOfMonth, monthsInterval } = recurrence
    
    if (monthsInterval === 1) {
      return `Cada mes el día ${dayOfMonth}`
    } else {
      return `Cada ${monthsInterval} meses el día ${dayOfMonth}`
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-large w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 flex items-center space-x-2">
                <Repeat className="text-purple-600" size={24} />
                <span>Tareas Recurrentes</span>
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Gestiona las tareas que se crean automáticamente cada mes
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <span className="text-2xl text-neutral-600">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {recurringTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Repeat className="text-purple-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No hay tareas recurrentes
              </h3>
              <p className="text-neutral-600 mb-4">
                Crea una tarea y activa la opción "Tarea Recurrente" para que se genere automáticamente cada mes
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-purple-900 flex items-start space-x-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Ejemplo:</strong> "Pago de remuneraciones" cada día 30 a las 09:00
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {recurringTasks.map(task => {
                const nextOccurrence = formatNextOccurrence(task.recurrence)
                
                return (
                  <div
                    key={task.id}
                    className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
                          <Repeat className="text-purple-600" size={18} />
                          <span>{task.title}</span>
                        </h3>
                        {task.description && (
                          <p className="text-sm text-neutral-600 mt-1">{task.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEdit(task)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} className="text-neutral-600" />
                        </button>
                        <button
                          onClick={() => onDelete(task)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Recurrencia */}
                      <div className="bg-white p-3 rounded-lg border border-purple-200">
                        <p className="text-xs text-neutral-600 mb-1">Recurrencia</p>
                        <p className="text-sm font-semibold text-neutral-900 flex items-center space-x-1">
                          <Calendar size={14} className="text-purple-600" />
                          <span>{getRecurrenceText(task.recurrence)}</span>
                        </p>
                      </div>

                      {/* Próxima generación */}
                      <div className="bg-white p-3 rounded-lg border border-blue-200">
                        <p className="text-xs text-neutral-600 mb-1">Próxima generación</p>
                        <p className="text-sm font-semibold text-neutral-900">
                          📅 {nextOccurrence}
                        </p>
                      </div>

                      {/* Hora */}
                      {task.dueTime && (
                        <div className="bg-white p-3 rounded-lg border border-neutral-200">
                          <p className="text-xs text-neutral-600 mb-1">Hora límite</p>
                          <p className="text-sm font-semibold text-neutral-900 flex items-center space-x-1">
                            <Clock size={14} className="text-neutral-600" />
                            <span>{task.dueTime}</span>
                          </p>
                        </div>
                      )}

                      {/* Asignados */}
                      {task.assignees && task.assignees.length > 0 && (
                        <div className="bg-white p-3 rounded-lg border border-neutral-200">
                          <p className="text-xs text-neutral-600 mb-1">Asignado a</p>
                          <div className="flex items-center space-x-1">
                            <Users size={14} className="text-neutral-600" />
                            <p className="text-sm font-semibold text-neutral-900">
                              {task.assignees.length === 1 
                                ? task.assignees[0]
                                : `${task.assignees.length} personas`
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Prioridad y Tags */}
                    <div className="flex items-center space-x-2 mt-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${getPriorityColor(task.priority)}`}>
                        Prioridad: {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                      {task.tags && task.tags.length > 0 && (
                        <>
                          {task.tags.map((tag, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              <AlertCircle size={14} className="inline mr-1" />
              Las tareas se generarán automáticamente el día indicado cada mes
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecurringTasksPanel
