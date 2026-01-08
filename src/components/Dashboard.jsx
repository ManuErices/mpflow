import { TrendingUp, Users, CheckCircle, Clock, Calendar, AlertTriangle, Folder, Target } from 'lucide-react'

function Dashboard({ projects, tasks, teamMembers }) {
  // Calcular estadísticas
  const allTasks = Object.values(tasks).flat()
  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter(t => t.status === 'done').length
  const inProgressTasks = allTasks.filter(t => t.status === 'in-progress').length
  const pendingTasks = allTasks.filter(t => t.status === 'todo').length
  const reviewTasks = allTasks.filter(t => t.status === 'review').length
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  // Tareas por prioridad
  const highPriorityTasks = allTasks.filter(t => t.priority === 'high').length
  const mediumPriorityTasks = allTasks.filter(t => t.priority === 'medium').length
  const lowPriorityTasks = allTasks.filter(t => t.priority === 'low').length

  // Proyectos activos
  const activeProjects = projects.filter(p => p.status === 'En Progreso').length
  
  // Tareas vencidas
  const today = new Date()
  const overdueTasks = allTasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false
    return new Date(t.dueDate) < today
  }).length

  // Tareas próximas a vencer (próximos 7 días)
  const upcomingTasks = allTasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false
    const dueDate = new Date(t.dueDate)
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  })

  // Miembros más productivos
  const memberStats = {}
  allTasks.forEach(task => {
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

  const topMembers = Object.entries(memberStats)
    .map(([name, stats]) => ({
      name,
      completed: stats.completed,
      rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }))
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 5)

  const mainStats = [
    {
      title: 'Total Tareas',
      value: totalTasks,
      icon: Target,
      color: 'from-neutral-500 to-neutral-600',
      bgColor: 'bg-neutral-100',
      textColor: 'text-neutral-700'
    },
    {
      title: 'Completadas',
      value: completedTasks,
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700'
    },
    {
      title: 'En Progreso',
      value: inProgressTasks,
      icon: Clock,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-100',
      textColor: 'text-primary-700'
    },
    {
      title: 'Tasa de Completitud',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 text-sm mt-1">Resumen general de proyectos y tareas</p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={stat.textColor} size={24} strokeWidth={2} />
                </div>
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</div>
              <div className="text-sm text-neutral-600">{stat.title}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico de distribución */}
        <div className="lg:col-span-8 space-y-6">
          {/* Estado de tareas */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="font-semibold text-neutral-900 mb-4">Estado de Tareas</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-neutral-700">Por Hacer</span>
                  <span className="font-semibold text-neutral-900">{pendingTasks}</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-neutral-500 h-2 rounded-full transition-all"
                    style={{ width: `${totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-neutral-700">En Progreso</span>
                  <span className="font-semibold text-neutral-900">{inProgressTasks}</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-neutral-700">En Revisión</span>
                  <span className="font-semibold text-neutral-900">{reviewTasks}</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${totalTasks > 0 ? (reviewTasks / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-neutral-700">Completadas</span>
                  <span className="font-semibold text-neutral-900">{completedTasks}</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tareas por prioridad */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="font-semibold text-neutral-900 mb-4">Tareas por Prioridad</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                <div className="text-2xl font-bold text-red-700 mb-1">{highPriorityTasks}</div>
                <div className="text-sm text-red-600">Alta Prioridad</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
                <div className="text-2xl font-bold text-amber-700 mb-1">{mediumPriorityTasks}</div>
                <div className="text-sm text-amber-600">Media Prioridad</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-500">
                <div className="text-2xl font-bold text-emerald-700 mb-1">{lowPriorityTasks}</div>
                <div className="text-sm text-emerald-600">Baja Prioridad</div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="lg:col-span-4 space-y-6">
          {/* Alertas */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="font-semibold text-neutral-900 mb-4">Alertas</h3>
            <div className="space-y-3">
              {overdueTasks > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm text-red-900">{overdueTasks} Tareas Vencidas</div>
                      <div className="text-xs text-red-700 mt-0.5">Requieren atención inmediata</div>
                    </div>
                  </div>
                </div>
              )}

              {upcomingTasks.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Calendar size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm text-amber-900">{upcomingTasks.length} Próximas</div>
                      <div className="text-xs text-amber-700 mt-0.5">Vencen en los próximos 7 días</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Folder size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm text-blue-900">{activeProjects} Proyectos Activos</div>
                    <div className="text-xs text-blue-700 mt-0.5">En progreso actualmente</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top performers */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="font-semibold text-neutral-900 mb-4">Top Colaboradores</h3>
            {topMembers.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-sm">
                No hay datos disponibles
              </div>
            ) : (
              <div className="space-y-3">
                {topMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{member.name}</div>
                        <div className="text-xs text-neutral-500">{member.completed} completadas</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-primary-600">{member.rate}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
