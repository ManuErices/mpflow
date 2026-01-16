import { X, Search, Calendar, Flag, CheckCircle } from 'lucide-react'
import { useState } from 'react'

function TaskReferenceModal({ isOpen, onClose, tasks, onSelectTask, selectedMember }) {
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  // Obtener todas las tareas
  const allTasks = Object.values(tasks).flat()

  // Filtrar tareas por búsqueda
  const filteredTasks = allTasks.filter(task => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      task.title?.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.assignee?.toLowerCase().includes(query)
    )
  })

  const statusConfig = {
    'todo': { label: 'Por Hacer', color: 'bg-neutral-500', textColor: 'text-neutral-700' },
    'in-progress': { label: 'En Progreso', color: 'bg-primary-600', textColor: 'text-primary-700' },
    'review': { label: 'Revisión', color: 'bg-blue-500', textColor: 'text-blue-700' },
    'done': { label: 'Completado', color: 'bg-emerald-500', textColor: 'text-emerald-700' }
  }

  const priorityConfig = {
    high: { label: 'Alta', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
    medium: { label: 'Media', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    low: { label: 'Baja', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' }
  }

  const handleSelectTask = (task) => {
    onSelectTask(task)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-large w-full max-w-2xl max-h-[80vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Referenciar Tarea
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Selecciona una tarea para compartir con {selectedMember?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X size={18} className="text-neutral-500" />
            </button>
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tarea..."
              className="w-full pl-10 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>
        </div>

        {/* Lista de tareas */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={48} className="mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-600 font-medium">No se encontraron tareas</p>
              {searchQuery && (
                <p className="text-sm text-neutral-500 mt-1">
                  Intenta con otros términos de búsqueda
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map(task => {
                const status = statusConfig[task.status]
                const priority = priorityConfig[task.priority]

                return (
                  <button
                    key={task.id}
                    onClick={() => handleSelectTask(task)}
                    className="w-full p-4 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-all text-left"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-neutral-900 flex-1 pr-2">
                        {task.title}
                      </h3>
                      <div className={`w-2 h-2 rounded-full ${status.color} flex-shrink-0 mt-1.5`}></div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {/* Prioridad */}
                        <span className={`inline-flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-md ${priority.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`}></span>
                          <span>{priority.label}</span>
                        </span>

                        {/* Estado */}
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                          <span className={`text-xs font-medium ${status.textColor}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      {/* Asignado y Fecha */}
                      <div className="flex items-center space-x-3 text-xs text-neutral-500">
                        {task.assignee && (
                          <div className="flex items-center space-x-1">
                            <div className="w-5 h-5 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                              <span className="text-white text-[9px] font-semibold">
                                {task.assignee.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{task.assignee}</span>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span>{new Date(task.dueDate).toLocaleDateString('es-ES')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskReferenceModal
