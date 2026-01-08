import { useState } from 'react'
import { TrendingUp, Users, CheckCircle, Clock, Calendar, AlertTriangle, Folder, Target, Filter, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function Dashboard({ projects, tasks, teamMembers }) {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState('all') // 'all' o 'mine'
  
  const currentUserName = user?.displayName || user?.email || ''

  // Filtrar tareas según el modo de vista
  const getFilteredTasks = () => {
    const allTasks = Object.values(tasks).flat()
    if (viewMode === 'mine') {
      return allTasks.filter(task => task.assignee === currentUserName)
    }
    return allTasks
  }

  const filteredTasks = getFilteredTasks()

  // Calcular estadísticas
  const totalTasks = filteredTasks.length
  const completedTasks = filteredTasks.filter(t => t.status === 'done').length
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress').length
  const pendingTasks = filteredTasks.filter(t => t.status === 'todo').length
  const reviewTasks = filteredTasks.filter(t => t.status === 'review').length
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  // Tareas por prioridad
  const highPriorityTasks = filteredTasks.filter(t => t.priority === 'high').length
  const mediumPriorityTasks = filteredTasks.filter(t => t.priority === 'medium').length
  const lowPriorityTasks = filteredTasks.filter(t => t.priority === 'low').length

  // Proyectos activos
  const activeProjects = projects.filter(p => p.status === 'En Progreso').length
  
  // Tareas vencidas
  const today = new Date()
  const overdueTasks = filteredTasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false
    return new Date(t.dueDate) < today
  }).length

  // Tareas próximas a vencer (próximos 7 días)
  const upcomingTasks = filteredTasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false
    const dueDate = new Date(t.dueDate)
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  })

  // Miembros más productivos (solo en modo 'all')
  const memberStats = {}
  if (viewMode === 'all') {
    filteredTasks.forEach(task => {
      if (task.assignee) {
        if (!memberStats[task.assignee]) {
          memberStats[task.assignee] = { completed: 0, total: 0 }
        }
        memberStats[task.assignee].total++
        if (task.status === 'done') {
          memberStats[task.assignee].completed++
        }
      }
    })
  }

  const topMembers = Object.entries(memberStats)
    .map(([name, stats]) => ({
      name,
      ...stats,
      rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5)

  return (
    <div className="space-y-5">
      {/* Header con filtro */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-sm text-neutral-600 mt-1">
              {viewMode === 'all' ? 'Resumen general del equipo' : 'Tus estadísticas personales'}
            </p>
          </div>
          
          {/* Selector de vista */}
          <div className="flex items-center space-x-2 bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Users size={16} />
              <span>Todo el Equipo</span>
            </button>
            <button
              onClick={() => setViewMode('mine')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'mine'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <User size={16} />
              <span>Mis Tareas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tareas */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-neutral-100 rounded-lg">
              <Target className="text-neutral-700" size={20} />
            </div>
            <span className="text-2xl font-bold text-neutral-900">{totalTasks}</span>
          </div>
          <p className="text-sm font-medium text-neutral-600">Total Tareas</p>
          <p className="text-xs text-neutral-500 mt-1">{pendingTasks} pendientes</p>
        </div>

        {/* Completadas */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="text-emerald-600" size={20} />
            </div>
            <span className="text-2xl font-bold text-emerald-600">{completedTasks}</span>
          </div>
          <p className="text-sm font-medium text-neutral-600">Completadas</p>
          <p className="text-xs text-neutral-500 mt-1">{completionRate}% de progreso</p>
        </div>

        {/* En Progreso */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Clock className="text-primary-600" size={20} />
            </div>
            <span className="text-2xl font-bold text-primary-600">{inProgressTasks}</span>
          </div>
          <p className="text-sm font-medium text-neutral-600">En Progreso</p>
          <p className="text-xs text-neutral-500 mt-1">{reviewTasks} en revisión</p>
        </div>

        {/* Vencidas */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <span className="text-2xl font-bold text-red-600">{overdueTasks}</span>
          </div>
          <p className="text-sm font-medium text-neutral-600">Vencidas</p>
          <p className="text-xs text-neutral-500 mt-1">{upcomingTasks.length} próximas a vencer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Distribución por Prioridad */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
            <TrendingUp size={18} />
            <span>Distribución por Prioridad</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm text-neutral-600">Alta</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">{highPriorityTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <span className="text-sm text-neutral-600">Media</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">{mediumPriorityTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-sm text-neutral-600">Baja</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">{lowPriorityTasks}</span>
            </div>
          </div>
        </div>

        {/* Resumen de Proyectos */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
            <Folder size={18} />
            <span>Proyectos</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Total</span>
              <span className="text-2xl font-bold text-neutral-900">{projects.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Activos</span>
              <span className="text-lg font-semibold text-primary-600">{activeProjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Miembros</span>
              <span className="text-lg font-semibold text-neutral-900">{teamMembers.length}</span>
            </div>
          </div>
        </div>

        {/* Top Performers (solo en modo 'all') */}
        {viewMode === 'all' && topMembers.length > 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
              <Users size={18} />
              <span>Top Colaboradores</span>
            </h3>
            <div className="space-y-3">
              {topMembers.map((member, index) => (
                <div key={member.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-neutral-400">#{index + 1}</span>
                    <span className="text-sm text-neutral-900">{member.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{member.rate}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estadísticas personales en modo 'mine' */}
        {viewMode === 'mine' && (
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
              <User size={18} />
              <span>Tu Rendimiento</span>
            </h3>
            <div className="space-y-3">
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <p className="text-3xl font-bold text-primary-600">{completionRate}%</p>
                <p className="text-sm text-neutral-600 mt-1">Tasa de completación</p>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Asignadas</span>
                <span className="font-semibold text-neutral-900">{totalTasks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Completadas</span>
                <span className="font-semibold text-emerald-600">{completedTasks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Pendientes</span>
                <span className="font-semibold text-amber-600">{pendingTasks}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tareas Próximas a Vencer */}
      {upcomingTasks.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
            <Calendar size={18} />
            <span>Próximas a Vencer (7 días)</span>
          </h3>
          <div className="space-y-2">
            {upcomingTasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{task.title}</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    {task.assignee && `Asignada a: ${task.assignee}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-amber-700">
                    {new Date(task.dueDate).toLocaleDateString('es-ES')}
                  </p>
                  {task.dueTime && (
                    <p className="text-xs text-neutral-500">{task.dueTime}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
