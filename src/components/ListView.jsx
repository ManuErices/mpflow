import { useState } from 'react'
import { Edit2, Trash2, Calendar, User, Flag, CheckSquare, ArrowUp Down, ArrowUp, ArrowDown } from 'lucide-react'

function ListView({ tasks = {}, onEditTask, onDeleteTask, onMoveTask }) {
  const [sortField, setSortField] = useState('dueDate')
  const [sortDirection, setSortDirection] = useState('asc')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Convertir tasks object a array plano
  const allTasks = Object.entries(tasks).flatMap(([status, taskList]) =>
    taskList.map(task => ({ ...task, status }))
  )

  // Filtrar tareas
  const filteredTasks = allTasks.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false
    if (filterStatus !== 'all' && task.status !== filterStatus) return false
    return true
  })

  // Ordenar tareas
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    // Manejo especial para fechas
    if (sortField === 'dueDate') {
      aVal = a.dueDate ? new Date(a.dueDate) : new Date('2099-12-31')
      bVal = b.dueDate ? new Date(b.dueDate) : new Date('2099-12-31')
    }

    // Manejo especial para checklist
    if (sortField === 'progress') {
      aVal = a.checklist ? (a.checklist.completed / a.checklist.total) * 100 : 0
      bVal = b.checklist ? (b.checklist.completed / b.checklist.total) * 100 : 0
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-neutral-400" />
    return sortDirection === 'asc' ? 
      <ArrowUp size={14} className="text-primary-600" /> : 
      <ArrowDown size={14} className="text-primary-600" />
  }

  const priorityConfig = {
    high: { label: 'Alta', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
    medium: { label: 'Media', color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50' },
    low: { label: 'Baja', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50' }
  }

  const statusConfig = {
    'todo': { label: 'Por Hacer', color: '#64748b' },
    'in-progress': { label: 'En Progreso', color: '#9333ea' },
    'review': { label: 'Revisión', color: '#3b82f6' },
    'done': { label: 'Completado', color: '#10b981' }
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Prioridad</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos</option>
                <option value="todo">Por Hacer</option>
                <option value="in-progress">En Progreso</option>
                <option value="review">Revisión</option>
                <option value="done">Completado</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-neutral-600">
            <span className="font-semibold">{sortedTasks.length}</span> {sortedTasks.length === 1 ? 'tarea' : 'tareas'}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Tarea</span>
                    <SortIcon field="title" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Prioridad</span>
                    <SortIcon field="priority" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Estado</span>
                    <SortIcon field="status" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => handleSort('assignee')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Asignado</span>
                    <SortIcon field="assignee" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Vencimiento</span>
                    <SortIcon field="dueDate" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => handleSort('progress')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Progreso</span>
                    <SortIcon field="progress" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-neutral-500 text-sm">
                    No hay tareas para mostrar
                  </td>
                </tr>
              ) : (
                sortedTasks.map((task) => {
                  const priority = priorityConfig[task.priority]
                  const status = statusConfig[task.status]
                  const progress = task.checklist ? (task.checklist.completed / task.checklist.total) * 100 : 0

                  return (
                    <tr key={task.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-semibold text-sm text-neutral-900">{task.title}</div>
                          <div className="text-xs text-neutral-600 line-clamp-1">{task.description}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-semibold ${priority.bgColor} ${priority.textColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priority.color}`}></span>
                          <span>{priority.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }}></div>
                          <span className="text-sm text-neutral-700">{status.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {task.assignee ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                              <span className="text-white text-[9px] font-semibold">
                                {task.assignee.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-sm text-neutral-700">{task.assignee}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {task.dueDate ? (
                          <div className="flex items-center space-x-1 text-sm text-neutral-700">
                            <Calendar size={14} />
                            <span>{new Date(task.dueDate).toLocaleDateString('es-ES')}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">Sin fecha</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {task.checklist && task.checklist.total > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-neutral-600">
                              <span>{Math.round(progress)}%</span>
                              <span className="text-[10px]">{task.checklist.completed}/{task.checklist.total}</span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-1.5">
                              <div
                                className="bg-primary-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1.5 hover:bg-neutral-100 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={14} className="text-neutral-600" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task)}
                            className="p-1.5 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ListView
