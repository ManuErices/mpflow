import { useState } from 'react'
import { MoreVertical, Plus, Clock, CheckCircle2, AlertCircle, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import DraggableTask from './DraggableTask'
import ExportMenu from './ExportMenu'

function ProjectBoard({ projects, selectedProject, tasks = {}, onEditTask, onDeleteTask, onMoveTask }) {
  const { user } = useAuth()
  const [dragOverColumn, setDragOverColumn] = useState(null)
  const [showRestrictedToast, setShowRestrictedToast] = useState(false)

  const currentUserName = user?.displayName || user?.email || ''

  const columns = [
    { id: 'todo', title: 'Por Hacer', color: '#64748b' },
    { id: 'in-progress', title: 'En Progreso', color: '#9333ea' },
    { id: 'review', title: 'Revisión', color: '#3b82f6' },
    { id: 'done', title: 'Completado', color: '#10b981' },
  ]

  // Project Summary Stats
  const allTasks = Object.values(tasks).flat()
  const totalTasks = allTasks.length
  const completedTasks = (tasks['done'] || []).length
  const inProgressTasks = (tasks['in-progress'] || []).length

  // Verificar si el usuario puede mover una tarea
  const canMoveTask = (task) => {
    // Si no está asignada a nadie, cualquiera puede moverla
    if (!task.assignee) return true
    // Si está asignada, solo el asignado puede moverla
    return task.assignee === currentUserName
  }

  const handleDragStart = (e, task, fromStatus) => {
    if (!canMoveTask(task)) {
      e.preventDefault()
      setShowRestrictedToast(true)
      setTimeout(() => setShowRestrictedToast(false), 3000)
      return
    }
    e.dataTransfer.setData('taskId', task.id)
    e.dataTransfer.setData('fromStatus', fromStatus)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, columnId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  const handleDragLeave = (e) => {
    if (e.currentTarget === e.target) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e, toStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    
    const taskId = e.dataTransfer.getData('taskId')
    const fromStatus = e.dataTransfer.getData('fromStatus')
    
    if (fromStatus !== toStatus && taskId) {
      // Buscar la tarea para verificar permisos
      const task = allTasks.find(t => t.id === taskId)
      if (task && canMoveTask(task)) {
        onMoveTask(taskId, fromStatus, toStatus)
      }
    }
  }

  return (
    <div className="space-y-5">
      {/* Toast de restricción */}
      {showRestrictedToast && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <Lock size={18} />
            <span className="font-medium">Solo puedes mover tus tareas asignadas</span>
          </div>
        </div>
      )}

      {/* Project Overview */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 mb-1">
              {selectedProject ? selectedProject.name : 'Tablero de Proyecto'}
            </h1>
            {selectedProject?.description && (
              <p className="text-sm text-neutral-600">{selectedProject.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <ExportMenu tasks={tasks} projectName={selectedProject?.name} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-neutral-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-neutral-900">{totalTasks}</p>
              </div>
              <MoreVertical className="text-neutral-400" size={20} />
            </div>
          </div>
          
          <div className="p-3 bg-primary-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-primary-700 mb-1">En Progreso</p>
                <p className="text-2xl font-bold text-primary-700">{inProgressTasks}</p>
              </div>
              <Clock className="text-primary-500" size={20} />
            </div>
          </div>
          
          <div className="p-3 bg-emerald-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-700 mb-1">Completadas</p>
                <p className="text-2xl font-bold text-emerald-700">{completedTasks}</p>
              </div>
              <CheckCircle2 className="text-emerald-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
            {/* Column Header */}
            <div className="bg-white rounded-t-xl border border-neutral-200 border-b-0 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 className="font-semibold text-neutral-900 text-sm">{column.title}</h3>
                </div>
                <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                  {(tasks[column.id] || []).length}
                </span>
              </div>
            </div>

            {/* Column Body */}
            <div
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex-1 bg-neutral-50 rounded-b-xl border border-neutral-200 border-t-0 p-3 space-y-2 min-h-[500px] transition-colors ${
                dragOverColumn === column.id ? 'bg-primary-50 border-primary-300' : ''
              }`}
            >
              {(tasks[column.id] || []).map((task) => {
                const isLocked = !canMoveTask(task)
                return (
                  <div
                    key={task.id}
                    draggable={!isLocked}
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    className={`${isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-move'}`}
                    title={isLocked ? 'Solo el asignado puede mover esta tarea' : 'Arrastra para mover'}
                  >
                    <DraggableTask 
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                    {isLocked && (
                      <div className="absolute top-2 right-2 bg-neutral-900/80 text-white p-1 rounded">
                        <Lock size={12} />
                      </div>
                    )}
                  </div>
                )
              })}
              
              {(tasks[column.id] || []).length === 0 && (
                <div className="flex items-center justify-center h-32 text-neutral-400">
                  <p className="text-xs">No hay tareas</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectBoard
