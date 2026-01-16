import { useState } from 'react'
import { Edit2, Trash2, Calendar, User, Flag, CheckSquare, ArrowUpDown, ChevronDown, Clock, UserCheck, Paperclip, Search, X } from 'lucide-react'

function ListView({ tasks = {}, onEditTask, onDeleteTask, onMoveTask, onOpenAttachments }) {
  const [sortField, setSortField] = useState('dueDate')
  const [sortDirection, setSortDirection] = useState('asc')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedRow, setExpandedRow] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const statusConfig = {
    'todo': { label: 'Por Hacer', color: 'bg-neutral-500', textColor: 'text-neutral-700' },
    'in-progress': { label: 'En Progreso', color: 'bg-primary-600', textColor: 'text-primary-700' },
    'review': { label: 'Revisión', color: 'bg-blue-500', textColor: 'text-blue-700' },
    'done': { label: 'Completado', color: 'bg-emerald-500', textColor: 'text-emerald-700' }
  }

  const priorityConfig = {
    high: { label: 'Alta', color: 'bg-red-100 text-red-700' },
    medium: { label: 'Media', color: 'bg-amber-100 text-amber-700' },
    low: { label: 'Baja', color: 'bg-emerald-100 text-emerald-700' }
  }

  // Convertir tasks object a array plano
  const allTasks = Object.entries(tasks).flatMap(([status, taskList]) =>
    taskList.map(task => ({ ...task, status }))
  )

  // Filtrar tareas por búsqueda
  const searchedTasks = allTasks.filter(task => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    return (
      task.title?.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.assignee?.toLowerCase().includes(query) ||
      task.requestedBy?.toLowerCase().includes(query) ||
      task.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  })

  // Filtrar tareas por prioridad y estado
  const filteredTasks = searchedTasks.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false
    if (filterStatus !== 'all' && task.status !== filterStatus) return false
    return true
  })

  // Ordenar tareas
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (sortField === 'dueDate') {
      aVal = a.dueDate ? new Date(a.dueDate) : new Date('2099-12-31')
      bVal = b.dueDate ? new Date(b.dueDate) : new Date('2099-12-31')
    }

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

  const handleStatusChange = (task, newStatus) => {
    if (task.status !== newStatus) {
      onMoveTask(task.id, task.status, newStatus)
    }
    setExpandedRow(null)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-neutral-400" />
    return sortDirection === 'asc' ? 
      <ArrowUpDown size={14} className="text-primary-600" /> : 
      <ArrowUpDown size={14} className="text-primary-600 rotate-180" />
  }

  return (
    <div className="space-y-4">
      {/* Buscador y Filtros */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Buscador */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Buscar tareas
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, descripción, asignado..."
                className="w-full pl-10 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-200 rounded transition-colors"
                  title="Limpiar búsqueda"
                >
                  <X size={14} className="text-neutral-500" />
                </button>
              )}
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Prioridad</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos</option>
                <option value="todo">Por Hacer</option>
                <option value="in-progress">En Progreso</option>
                <option value="review">Revisión</option>
                <option value="done">Completado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3">
          <div>
            {searchQuery && (
              <p className="text-xs text-neutral-600">
                Mostrando <span className="font-semibold text-primary-600">{sortedTasks.length}</span> de <span className="font-semibold">{allTasks.length}</span> tareas
              </p>
            )}
          </div>
          <span className="text-sm text-neutral-600 font-medium">
            {sortedTasks.length} tarea{sortedTasks.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center space-x-1 text-xs font-semibold text-neutral-700 uppercase hover:text-primary-600 transition-colors"
                  >
                    <span>Tarea</span>
                    <SortIcon field="title" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 text-xs font-semibold text-neutral-700 uppercase hover:text-primary-600 transition-colors"
                  >
                    <span>Estado</span>
                    <SortIcon field="status" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('priority')}
                    className="flex items-center space-x-1 text-xs font-semibold text-neutral-700 uppercase hover:text-primary-600 transition-colors"
                  >
                    <span>Prioridad</span>
                    <SortIcon field="priority" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('assignee')}
                    className="flex items-center space-x-1 text-xs font-semibold text-neutral-700 uppercase hover:text-primary-600 transition-colors"
                  >
                    <span>Asignado</span>
                    <SortIcon field="assignee" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('dueDate')}
                    className="flex items-center space-x-1 text-xs font-semibold text-neutral-700 uppercase hover:text-primary-600 transition-colors"
                  >
                    <span>Fecha Límite</span>
                    <SortIcon field="dueDate" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold text-neutral-700 uppercase">Solicitante</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('progress')}
                    className="flex items-center space-x-1 text-xs font-semibold text-neutral-700 uppercase hover:text-primary-600 transition-colors"
                  >
                    <span>Progreso</span>
                    <SortIcon field="progress" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <span className="text-xs font-semibold text-neutral-700 uppercase">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <Search size={48} className="text-neutral-300" />
                      <p className="text-neutral-600 font-medium">
                        {searchQuery ? 'No se encontraron tareas' : 'No hay tareas'}
                      </p>
                      {searchQuery && (
                        <p className="text-sm text-neutral-500">
                          Intenta con otros términos de búsqueda
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-neutral-50 transition-colors">
                    {/* Tarea */}
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-neutral-500 truncate mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Estado con Dropdown */}
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setExpandedRow(expandedRow === task.id ? null : task.id)}
                          className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                        >
                          <div className={`w-2 h-2 rounded-full ${statusConfig[task.status].color}`}></div>
                          <span className={`text-xs font-medium ${statusConfig[task.status].textColor}`}>
                            {statusConfig[task.status].label}
                          </span>
                          <ChevronDown size={12} className="text-neutral-400" />
                        </button>

                        {/* Dropdown de Estados */}
                        {expandedRow === task.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-40"
                              onClick={() => setExpandedRow(null)}
                            />
                            <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-neutral-200 py-1 z-50 min-w-[140px]">
                              {Object.entries(statusConfig).map(([statusKey, statusData]) => (
                                <button
                                  key={statusKey}
                                  onClick={() => handleStatusChange(task, statusKey)}
                                  className={`w-full flex items-center space-x-2 px-3 py-2 hover:bg-neutral-50 transition-colors ${
                                    task.status === statusKey ? 'bg-primary-50' : ''
                                  }`}
                                >
                                  <div className={`w-2 h-2 rounded-full ${statusData.color}`}></div>
                                  <span className={`text-xs font-medium ${statusData.textColor}`}>
                                    {statusData.label}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Prioridad */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${priorityConfig[task.priority]?.color || 'bg-neutral-100 text-neutral-700'}`}>
                        {priorityConfig[task.priority]?.label || 'N/A'}
                      </span>
                    </td>

                    {/* Asignado */}
                    <td className="px-4 py-3">
                      {task.assignee ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                            <span className="text-white text-[10px] font-semibold">
                              {task.assignee.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-700">{task.assignee}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">Sin asignar</span>
                      )}
                    </td>

                    {/* Fecha Límite */}
                    <td className="px-4 py-3">
                      {task.dueDate ? (
                        <div className="flex items-center space-x-1 text-xs text-neutral-600">
                          <Calendar size={12} />
                          <span>{new Date(task.dueDate).toLocaleDateString('es-ES')}</span>
                          {task.dueTime && (
                            <>
                              <Clock size={10} />
                              <span>{task.dueTime}</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">Sin fecha</span>
                      )}
                    </td>

                    {/* Solicitante */}
                    <td className="px-4 py-3">
                      {task.requestedBy ? (
                        <div className="flex items-center space-x-1 text-xs text-neutral-600">
                          <UserCheck size={12} />
                          <span className="truncate max-w-[100px]">{task.requestedBy}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">-</span>
                      )}
                    </td>

                    {/* Progreso */}
                    <td className="px-4 py-3">
                      {task.checklist && task.checklist.total > 0 ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-neutral-200 rounded-full h-1.5">
                            <div
                              className="bg-primary-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${(task.checklist.completed / task.checklist.total) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-neutral-600 font-medium">
                            {task.checklist.completed}/{task.checklist.total}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">-</span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1.5 hover:bg-primary-100 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} className="text-primary-600" />
                        </button>
                        {onOpenAttachments && (
                          <button
                            onClick={() => onOpenAttachments(task)}
                            className="p-1.5 hover:bg-blue-100 rounded transition-colors relative"
                            title="Adjuntar archivos"
                          >
                            <Paperclip size={14} className="text-blue-600" />
                            {task.attachments?.length > 0 && (
                              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                {task.attachments.length}
                              </span>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteTask(task)}
                          className="p-1.5 hover:bg-red-100 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ListView
