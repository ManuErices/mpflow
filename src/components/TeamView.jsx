import { useState } from 'react'
import { User, Mail, Phone, Briefcase, Plus, Edit2, Trash2, Search, Filter, CheckCircle, Clock } from 'lucide-react'

function TeamView({ tasks = {}, projects, onEditTask, teamMembers = [], onAddMember, onEditMember, onDeleteMember }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)

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

  // Extraer miembros únicos de las tareas si no hay teamMembers
  const uniqueMembers = teamMembers.length > 0 
    ? teamMembers 
    : [...new Set(allTasks.map(task => task.assignee).filter(Boolean))].map(name => ({
        name,
        role: 'Colaborador',
        email: `${name.toLowerCase().replace(' ', '.')}@obra.com`,
        phone: '+56 9 1234 5678',
        avatar: name.split(' ').map(n => n[0]).join('')
      }))

  // Filtrar miembros por búsqueda
  const filteredMembers = uniqueMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Equipo de Trabajo</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Gestiona los miembros y su carga de trabajo</p>
          </div>
          <button 
            onClick={onAddMember}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Agregar Miembro</span>
          </button>
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
              <p className="text-neutral-600 text-sm">No hay miembros en el equipo</p>
              <button
                onClick={onAddMember}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Agregar el primero
              </button>
            </div>
          ) : (
            filteredMembers.map((member, index) => {
              const stats = getMemberStats(member.name)
              const isSelected = selectedMember?.name === member.name

              return (
                <div
                  key={index}
                  onClick={() => setSelectedMember(member)}
                  className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'border-primary-500 shadow-md' : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white font-semibold text-sm">{member.avatar || member.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-neutral-900 truncate">{member.name}</h3>
                      <p className="text-xs text-neutral-600 truncate">{member.role}</p>
                      
                      {/* Stats */}
                      <div className="mt-2 flex items-center space-x-3 text-xs">
                        <div className="flex items-center space-x-1">
                          <CheckCircle size={12} className="text-emerald-600" />
                          <span className="text-neutral-600">{stats.completed}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={12} className="text-primary-600" />
                          <span className="text-neutral-600">{stats.inProgress}</span>
                        </div>
                        <div className="text-neutral-500">
                          {stats.total} total
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] text-neutral-600 mb-1">
                          <span>Completado</span>
                          <span className="font-semibold">{stats.completionRate}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-1.5">
                          <div
                            className="bg-primary-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${stats.completionRate}%` }}
                          />
                        </div>
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
          {!selectedMember ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <User size={64} className="mx-auto text-neutral-300 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Selecciona un miembro</h3>
              <p className="text-neutral-600 text-sm">Haz clic en un miembro para ver sus tareas y detalles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info Card */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-xl">
                        {selectedMember.avatar || selectedMember.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900">{selectedMember.name}</h2>
                      <p className="text-sm text-neutral-600 mt-0.5">{selectedMember.role}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-600">
                        {selectedMember.email && (
                          <div className="flex items-center space-x-1">
                            <Mail size={12} />
                            <span>{selectedMember.email}</span>
                          </div>
                        )}
                        {selectedMember.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone size={12} />
                            <span>{selectedMember.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => onEditMember(selectedMember)}
                      className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} className="text-neutral-600" />
                    </button>
                    <button 
                      onClick={() => {
                        setMemberToDelete(selectedMember)
                        setShowDeleteConfirm(true)
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {(() => {
                    const stats = getMemberStats(selectedMember.name)
                    return [
                      { label: 'Total', value: stats.total, color: 'from-neutral-500 to-neutral-600', icon: Briefcase },
                      { label: 'Completadas', value: stats.completed, color: 'from-emerald-500 to-emerald-600', icon: CheckCircle },
                      { label: 'En Progreso', value: stats.inProgress, color: 'from-primary-500 to-primary-600', icon: Clock },
                      { label: 'Tasa', value: `${stats.completionRate}%`, color: 'from-blue-500 to-blue-600', icon: Filter }
                    ].map((stat, idx) => {
                      const Icon = stat.icon
                      return (
                        <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-lg p-3 text-white`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs opacity-90">{stat.label}</span>
                            <Icon size={14} className="opacity-75" />
                          </div>
                          <div className="text-2xl font-bold">{stat.value}</div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>

              {/* Tareas del Miembro */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5">
                <h3 className="font-semibold text-neutral-900 mb-4">Tareas Asignadas</h3>
                
                {getSelectedMemberTasks().length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    No tiene tareas asignadas
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getSelectedMemberTasks().map((task) => {
                      const status = statusConfig[task.status]
                      const priority = priorityConfig[task.priority]
                      
                      return (
                        <div
                          key={task.id}
                          onClick={() => onEditTask(task)}
                          className="p-3 border border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-neutral-50 transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-sm text-neutral-900">{task.title}</h4>
                                <div className={`w-1.5 h-1.5 rounded-full ${priority.color}`}></div>
                              </div>
                              <p className="text-xs text-neutral-600 line-clamp-1">{task.description}</p>
                              <div className="flex items-center space-x-3 mt-2">
                                <span className={`text-[10px] px-2 py-0.5 ${status.color} text-white rounded-md font-medium`}>
                                  {status.label}
                                </span>
                                {task.dueDate && (
                                  <span className="text-[10px] text-neutral-500">
                                    {new Date(task.dueDate).toLocaleDateString('es-ES')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeamView
