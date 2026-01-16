import { Home, Folder, Users, Calendar, Settings, Plus, ChevronLeft, ChevronRight, Edit2, Trash2, MoreVertical, LogOut, CheckSquare } from 'lucide-react'
import { useState } from 'react'

function Sidebar({ 
  isOpen, 
  onToggle, 
  projects, 
  selectedProjects = [], // Ahora es un array
  onSelectProjects, // Función para manejar selección múltiple
  onAddProject, 
  onEditProject, 
  onDeleteProject, 
  currentView, 
  onViewChange, 
  user, 
  onLogout,
  tasks = {} // Recibir tasks para calcular contadores
}) {
  const [showProjectMenu, setShowProjectMenu] = useState(null)

  const menuItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard' },
    { icon: Folder, label: 'Proyectos', id: 'board' },
    { icon: Users, label: 'Equipo', id: 'team' },
    { icon: Calendar, label: 'Calendario', id: 'calendar' },
    { icon: Settings, label: 'Configuración', id: 'settings' },
  ]

  const handleProjectAction = (e, action, project) => {
    e.stopPropagation()
    setShowProjectMenu(null)
    action(project)
  }

  // Manejar selección/deselección de proyecto
  const handleToggleProject = (project) => {
    const isSelected = selectedProjects.some(p => p.id === project.id)
    
    if (isSelected) {
      // Deseleccionar - siempre permitir si hay al menos otro seleccionado
      if (selectedProjects.length > 1) {
        onSelectProjects(selectedProjects.filter(p => p.id !== project.id))
      } else {
        // Si es el último, no deseleccionar (mantener al menos uno)
        onSelectProjects([project])
      }
    } else {
      // Seleccionar - agregar al array
      onSelectProjects([...selectedProjects, project])
    }
  }

  // Seleccionar/Deseleccionar todos
  const handleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      // Si todos están seleccionados, seleccionar solo el primero
      onSelectProjects(projects.length > 0 ? [projects[0]] : [])
    } else {
      // Seleccionar todos
      onSelectProjects(projects)
    }
  }

  // Calcular tareas por proyecto
  const getProjectTaskCount = (projectId) => {
    const allTasks = Object.values(tasks).flat()
    const projectTasks = allTasks.filter(t => t.projectId === projectId)
    const completedTasks = projectTasks.filter(t => t.status === 'done')
    return {
      total: projectTasks.length,
      completed: completedTasks.length
    }
  }

  const allSelected = projects.length > 0 && selectedProjects.length === projects.length

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`bg-white border-r border-neutral-200 transition-all duration-300 flex flex-col fixed lg:relative inset-y-0 left-0 z-40 ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-16'
        }`}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-100">
          {isOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">MPF</span>
              </div>
              <span className="font-semibold text-sm text-neutral-900">MPFlow</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"
          >
            {isOpen ? <ChevronLeft size={16} className="text-neutral-600" /> : <ChevronRight size={16} className="text-neutral-600" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id || (item.id === 'board' && ['board', 'list'].includes(currentView))
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id !== 'settings') {
                    onViewChange(item.id)
                    // Cerrar sidebar en móvil al seleccionar
                    if (window.innerWidth < 1024) {
                      onToggle()
                    }
                  }
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-neutral-700 hover:bg-neutral-50'
                } ${item.id === 'settings' ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <Icon size={18} className="flex-shrink-0" strokeWidth={2} />
                {isOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            )
          })}

          {/* Projects Section */}
          {isOpen && (
            <div className="pt-6">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                  Proyectos ({selectedProjects.length}/{projects.length})
                </span>
                <div className="flex items-center space-x-1">
                  {projects.length > 1 && (
                    <button 
                      onClick={handleSelectAll}
                      className="p-0.5 hover:bg-neutral-100 rounded transition-colors"
                      title={allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                    >
                      <CheckSquare size={12} className={allSelected ? "text-primary-600" : "text-neutral-400"} />
                    </button>
                  )}
                  <button 
                    onClick={onAddProject}
                    className="p-0.5 hover:bg-neutral-100 rounded transition-colors"
                    title="Nuevo proyecto"
                  >
                    <Plus size={12} className="text-neutral-500" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-0.5">
                {projects.length === 0 ? (
                  <div className="px-3 py-4 text-center">
                    <p className="text-xs text-neutral-500">No hay proyectos</p>
                    <button
                      onClick={onAddProject}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1"
                    >
                      Crear primero
                    </button>
                  </div>
                ) : (
                  projects.map((project) => {
                    const isSelected = selectedProjects.some(p => p.id === project.id)
                    const taskCount = getProjectTaskCount(project.id)
                    
                    return (
                      <div
                        key={project.id}
                        className="relative group"
                      >
                        <button
                          onClick={() => handleToggleProject(project)}
                          className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg transition-all ${
                            isSelected ? 'bg-primary-50 border-l-2 border-primary-500' : 'hover:bg-neutral-50'
                          }`}
                        >
                          {/* Checkbox visual */}
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected 
                              ? 'bg-primary-600 border-primary-600' 
                              : 'border-neutral-300'
                          }`}>
                            {isSelected && (
                              <CheckSquare size={12} className="text-white" strokeWidth={3} />
                            )}
                          </div>
                          
                          {/* Color indicator */}
                          <div 
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          
                          {/* Project info */}
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-xs font-medium text-neutral-900 truncate">
                              {project.name}
                            </div>
                            <div className="text-[10px] text-neutral-500">
                              {taskCount.completed}/{taskCount.total}
                            </div>
                          </div>
                        </button>
                        
                        {/* Project Menu */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowProjectMenu(showProjectMenu === project.id ? null : project.id)
                            }}
                            className="p-1 hover:bg-neutral-200 rounded transition-colors"
                          >
                            <MoreVertical size={12} className="text-neutral-600" />
                          </button>
                          
                          {showProjectMenu === project.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-10 min-w-[140px]">
                              <button
                                onClick={(e) => handleProjectAction(e, onEditProject, project)}
                                className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                              >
                                <Edit2 size={12} />
                                <span>Editar</span>
                              </button>
                              <button
                                onClick={(e) => handleProjectAction(e, onDeleteProject, project)}
                                className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={12} />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </nav>

        {/* User Profile con Logout */}
        {isOpen && (
          <div className="p-3 border-t border-neutral-100 space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-xs">
                  {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-neutral-900 truncate">
                  {user?.displayName || user?.email || 'Usuario'}
                </div>
                <div className="text-[10px] text-neutral-500">MPF Ingeniería</div>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <LogOut size={16} strokeWidth={2} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar
