import { useState } from 'react'
import { MoreVertical, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import DraggableTask from './DraggableTask'
import ExportMenu from './ExportMenu'

function ProjectBoard({ projects, selectedProject, tasks = {}, onEditTask, onDeleteTask, onMoveTask }) {
  const [dragOverColumn, setDragOverColumn] = useState(null)

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

  const handleDragOver = (e, columnId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  const handleDragLeave = (e) => {
    // Solo actualizar si realmente salimos del contenedor
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
      onMoveTask(taskId, fromStatus, toStatus)
    }
  }

  return (
    <div className="space-y-5">
      {/* Project Overview */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">
              {selectedProject ? selectedProject.name : 'Todos los Proyectos'}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">Gestión de tareas y progreso</p>
          </div>
          <ExportMenu projects={projects} tasks={tasks} teamMembers={[]} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg p-3.5 border border-neutral-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-neutral-600 font-medium mb-1">Total</p>
                <p className="text-2xl font-bold text-neutral-900">{totalTasks}</p>
              </div>
              <div className="w-9 h-9 bg-neutral-200 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="text-neutral-600" size={18} strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-3.5 border border-primary-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-primary-700 font-medium mb-1">En Progreso</p>
                <p className="text-2xl font-bold text-primary-900">{inProgressTasks}</p>
              </div>
              <div className="w-9 h-9 bg-primary-200 rounded-lg flex items-center justify-center">
                <Clock className="text-primary-700" size={18} strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3.5 border border-emerald-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-emerald-700 font-medium mb-1">Completadas</p>
                <p className="text-2xl font-bold text-emerald-900">{completedTasks}</p>
              </div>
              <div className="w-9 h-9 bg-emerald-200 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="text-emerald-700" size={18} strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3.5 border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-blue-700 font-medium mb-1">Progreso</p>
                <p className="text-2xl font-bold text-blue-900">
                  {Math.round((completedTasks / totalTasks) * 100)}%
                </p>
              </div>
              <div className="w-9 h-9 bg-blue-200 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-blue-700" size={18} strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pb-4">
        {columns.map((column) => (
          <div 
            key={column.id} 
            className={`bg-neutral-50 rounded-xl p-3 min-h-[600px] border-2 transition-all ${
              dragOverColumn === column.id 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-neutral-200'
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <h3 className="font-semibold text-sm text-neutral-900">{column.title}</h3>
                <span className="bg-white text-neutral-600 text-xs font-medium px-1.5 py-0.5 rounded border border-neutral-200">
                  {(tasks[column.id] || []).length}
                </span>
              </div>
              <button className="p-1 hover:bg-white rounded transition-colors">
                <Plus size={14} className="text-neutral-500" strokeWidth={2} />
              </button>
            </div>

            {/* Tasks */}
            <div className="space-y-2.5">
              {(tasks[column.id] || []).length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  {dragOverColumn === column.id ? 'Suelta aquí' : 'Sin tareas'}
                </div>
              ) : (
                (tasks[column.id] || []).map((task) => (
                  <DraggableTask
                    key={task.id} 
                    task={task}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(task)}
                    onMove={(toStatus) => onMoveTask(task.id, column.id, toStatus)}
                    availableStatuses={columns.filter(c => c.id !== column.id)}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectBoard
