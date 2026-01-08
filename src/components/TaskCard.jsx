import { MoreVertical, Calendar, CheckSquare, Edit2, Trash2, MoveRight, UserCheck, Clock } from 'lucide-react'
import { useState } from 'react'

function TaskCard({ task, onEdit, onDelete, onMove, availableStatuses }) {
  const [showMenu, setShowMenu] = useState(false)

  const priorityConfig = {
    high: {
      bg: 'bg-red-50',
      border: 'border-l-red-500',
      text: 'text-red-700',
      dot: 'bg-red-500',
      label: 'Alta'
    },
    medium: {
      bg: 'bg-amber-50',
      border: 'border-l-amber-500',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      label: 'Media'
    },
    low: {
      bg: 'bg-emerald-50',
      border: 'border-l-emerald-500',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      label: 'Baja'
    },
  }

  const config = priorityConfig[task.priority]
  const progressPercentage = task.checklist ? (task.checklist.completed / task.checklist.total) * 100 : 0

  return (
    <div className={`bg-white rounded-lg border border-neutral-200 ${config.border} border-l-2 p-3.5 hover:shadow-md transition-all cursor-pointer group relative`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex-1 pr-2" onClick={onEdit}>
          <h4 className="font-semibold text-sm text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors leading-snug">
            {task.title}
          </h4>
          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">{task.description}</p>
        </div>
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-1 hover:bg-neutral-100 rounded transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={14} className="text-neutral-400" />
          </button>

          {/* Menu desplegable */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-20 min-w-[160px]">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                  onEdit()
                }}
                className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Edit2 size={12} />
                <span>Editar</span>
              </button>
              
              {availableStatuses && availableStatuses.length > 0 && (
                <>
                  <div className="border-t border-neutral-200 my-1"></div>
                  <div className="px-3 py-1 text-[10px] text-neutral-500 font-semibold uppercase">Mover a</div>
                  {availableStatuses.map(status => (
                    <button
                      key={status.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(false)
                        onMove(status.id)
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }}></div>
                      <span>{status.title}</span>
                    </button>
                  ))}
                </>
              )}
              
              <div className="border-t border-neutral-200 my-1"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                  onDelete()
                }}
                className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={12} />
                <span>Eliminar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Priority Badge */}
      <div className="mb-2.5">
        <span className={`inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-1 rounded-md ${config.bg} ${config.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
          <span>{config.label}</span>
        </span>
      </div>

      {/* Progress Bar */}
      {task.checklist && task.checklist.total > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] text-neutral-600 mb-1.5">
            <span className="flex items-center space-x-1 font-medium">
              <CheckSquare size={11} />
              <span>Progreso</span>
            </span>
            <span className="font-semibold text-neutral-700">
              {task.checklist.completed}/{task.checklist.total}
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-600 to-primary-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Solicitante */}
      {task.requestedBy && (
        <div className="mb-2.5 flex items-center space-x-1.5 text-[10px] text-neutral-500">
          <UserCheck size={11} className="text-neutral-400" />
          <span>Solicitada por: <span className="font-medium text-neutral-700">{task.requestedBy}</span></span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-neutral-100">
        <div className="flex items-center space-x-1 text-[10px] text-neutral-500 font-medium">
          <Calendar size={11} />
          <span>
            {task.dueDate 
              ? new Date(task.dueDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
              : 'Sin fecha'}
          </span>
          {task.dueTime && (
            <>
              <Clock size={10} className="ml-1" />
              <span>{task.dueTime}</span>
            </>
          )}
        </div>
        
        {task.assignee && (
          <div className="flex items-center space-x-1.5">
            <div className="w-5 h-5 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-[9px] font-semibold">
                {task.assignee.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="text-[10px] text-neutral-600 font-medium truncate max-w-[100px]">{task.assignee}</span>
          </div>
        )}
      </div>

      {/* Overlay para cerrar el menú al hacer click fuera */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}

export default TaskCard
