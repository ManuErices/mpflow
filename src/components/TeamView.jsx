import { useState, useEffect } from 'react'
import { User, Mail, Phone, Briefcase, Plus, Edit2, Trash2, Search, CheckCircle, Clock, MoreVertical } from 'lucide-react'

function TeamView({ tasks = {}, projects, onEditTask, onDeleteTask, teamMembers = [], onAddMember, onEditMember, onDeleteMember, currentUserName }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)

  // Seleccionar primer miembro automáticamente
  useEffect(() => {
    if (teamMembers.length > 0 && !selectedMember) {
      setSelectedMember(teamMembers[0])
    }
  }, [teamMembers])

  // Obtener todas las tareas
  const allTasks = Object.values(tasks).flat()

  // Calcular estadísticas por miembro
  const getMemberStats = (memberName) => {
    const memberTasks = allTasks.filter(task => task.assignee === memberName)
    const completedTasks = memberTasks.filter(task => task.status === 'done').length
    const inProgressTasks = memberTasks.filter(task => task.status === 'in-progress').length
    const pendingTasks = memberTasks.filter(task => task.status === 'todo').length
    
    return {
      total: memberTasks.length,
      completed: completedTasks,
      inProgress: inProgressTasks,
      pending: pendingTasks,
      completionRate: memberTasks.length > 0 ? Math.round((completedTasks / memberTasks.length) * 100) : 0
    }
  }

  // Filtrar miembros por búsqueda
  const filteredMembers = teamMembers.filter(member =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Obtener tareas del miembro seleccionado
  const getSelectedMemberTasks = () => {
    if (!selectedMember) return []
    return allTasks.filter(task => task.assignee === selectedMember.name)
  }

  const statusConfig = {
    'todo': { label: 'Por Hacer', color: 'bg-neutral-500' },
    'in-progress': { label: 'En Progreso', color: 'bg-primary-600' },
    'review': { label: 'Revisión', color: 'bg-blue-500' },
    'done': { label: 'Completado', color: 'bg-emerald-500' }
  }

  const priorityConfig = {
    high: { label: 'Alta', color: 'bg-red-500' },
    medium: { label: 'Media', color: 'bg-amber-500' },
    low: { label: 'Baja', color: 'bg-emerald-500' }
  }

  // Generar avatar desde nombre
  const getAvatar = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Equipo de Trabajo</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {teamMembers.length} {teamMembers.length === 1 ? 'miembro' : 'miembros'} en el equipo
            </p>
          </div>
          {currentUserName === "Manuel Erices" && (
            <button 
              onClick={onAddMember}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Agregar Miembro</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar miembros..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Lista de Miembros */}
        <div className="lg:col-span-4 space-y-3">
          {filteredMembers.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
              <User size={48} className="mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-600 text-sm">
                {teamMembers.length === 0 
                  ? 'No hay miembros en el equipo' 
                  : 'No se encontraron miembros'}
              </p>
              {teamMembers.length === 0 && currentUserName === "Manuel Erices" && (
                <button
                  onClick={onAddMember}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Agregar primer miembro
                </button>
              )}
            </div>
          ) : (
            filteredMembers.map((member) => {
              const stats = getMemberStats(member.name)
              const isSelected = selectedMember?.id === member.id

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`bg-white rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-primary-500 shadow-md' 
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {getAvatar(member.name)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-neutral-900 truncate">
                            {member.name}
                          </h3>
                          <p className="text-xs text-neutral-500 truncate">
                            {member.role || 'Sin rol asignado'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className="p-1 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <MoreVertical size={16} className="text-neutral-400" />
                        </button>
                        
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-10 min-w-[140px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditMember(member)
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                          >
                            <Edit2 size={14} />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteMember(member)
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Contacto */}
                    <div className="space-y-1.5 mb-3 text-xs">
                      {member.email && (
                        <div className="flex items-center space-x-2 text-neutral-600">
                          <Mail size={12} className="flex-shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center space-x-2 text-neutral-600">
                          <Phone size={12} className="flex-shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Estadísticas */}
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      <div className="text-center">
                        <p className="text-lg font-bold text-neutral-900">{stats.total}</p>
                        <p className="text-[10px] text-neutral-500">Tareas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-600">{stats.completed}</p>
                        <p className="text-[10px] text-neutral-500">Completadas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-primary-600">{stats.completionRate}%</p>
                        <p className="text-[10px] text-neutral-500">Eficiencia</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Detalle del Miembro */}
        <div className="lg:col-span-8">
          {selectedMember ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              {/* Header del miembro */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-xl">
                      {getAvatar(selectedMember.name)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">{selectedMember.name}</h2>
                    <p className="text-neutral-600 flex items-center space-x-1.5 mt-1">
                      <Briefcase size={14} />
                      <span>{selectedMember.role || 'Sin rol asignado'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {currentUserName === "Manuel Erices" && (
                    <>
                      <button
                        onClick={() => onEditMember(selectedMember)}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Editar miembro"
                      >
                        <Edit2 size={16} className="text-neutral-600" />
                      </button>
                      <button
                        onClick={() => onDeleteMember(selectedMember)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Eliminar miembro"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Información de contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-neutral-50 rounded-lg">
                {selectedMember.email && (
                  <div className="flex items-center space-x-3">
                    <Mail size={18} className="text-neutral-400" />
                    <div>
                      <p className="text-xs text-neutral-500">Email</p>
                      <p className="text-sm font-medium text-neutral-900">{selectedMember.email}</p>
                    </div>
                  </div>
                )}
                {selectedMember.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone size={18} className="text-neutral-400" />
                    <div>
                      <p className="text-xs text-neutral-500">Teléfono</p>
                      <p className="text-sm font-medium text-neutral-900">{selectedMember.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {(() => {
                  const stats = getMemberStats(selectedMember.name)
                  return (
                    <>
                      <div className="bg-neutral-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                        <p className="text-xs text-neutral-500 mt-1">Total Tareas</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                        <p className="text-xs text-emerald-600 mt-1">Completadas</p>
                      </div>
                      <div className="bg-primary-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-primary-600">{stats.inProgress}</p>
                        <p className="text-xs text-primary-600 mt-1">En Progreso</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                        <p className="text-xs text-amber-600 mt-1">Pendientes</p>
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Tareas asignadas */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3 flex items-center justify-between">
                  <span>Tareas Asignadas</span>
                  <span className="text-sm font-normal text-neutral-500">
                    {getSelectedMemberTasks().length} tareas
                  </span>
                </h3>
                
                {getSelectedMemberTasks().length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <CheckCircle size={48} className="mx-auto mb-2 text-neutral-300" />
                    <p className="text-sm">No hay tareas asignadas a este miembro</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getSelectedMemberTasks().map(task => (
                      <div
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-neutral-900 flex-1">{task.title}</h4>
                          <span className={`px-2 py-0.5 ${statusConfig[task.status]?.color} text-white text-xs rounded-full`}>
                            {statusConfig[task.status]?.label}
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-neutral-600 mb-2 line-clamp-1">{task.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            {task.priority && (
                              <span className={`px-2 py-0.5 ${priorityConfig[task.priority]?.color} text-white rounded-full`}>
                                {priorityConfig[task.priority]?.label}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="text-neutral-500 flex items-center space-x-1">
                                <Clock size={12} />
                                <span>{new Date(task.dueDate).toLocaleDateString('es-ES')}</span>
                              </span>
                            )}
                          </div>
                          
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex space-x-1">
                              {task.tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                                  {tag}
                                </span>
                              ))}
                              {task.tags.length > 2 && (
                                <span className="px-2 py-0.5 bg-neutral-200 text-neutral-600 rounded-full">
                                  +{task.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <User size={64} className="mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-600">Selecciona un miembro para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeamView
