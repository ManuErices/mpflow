import { LayoutGrid, List, Calendar as CalendarIcon, UserCircle, Plus, Bell, Filter, X, Users } from 'lucide-react'
import { useState } from 'react'

function TopBar({ 
  currentView, 
  onViewChange, 
  onAddTask,
  notificationCount,
  onNotificationClick,
  teamMembers = [],
  selectedMember,
  onMemberFilter
}) {
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  const views = [
    { id: 'board', label: 'Tablero', icon: LayoutGrid },
    { id: 'list', label: 'Lista', icon: List },
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
    { id: 'team', label: 'Equipo', icon: UserCircle }
  ]

  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">

        {/* Tabs */}
        <div className="flex items-center space-x-1">
          {views.map(view => {
            const Icon = view.icon
            return (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                  currentView === view.id
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{view.label}</span>
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">

          {/* Filtro */}
          {(currentView === 'board' || currentView === 'list') && (
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  selectedMember
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-neutral-100 text-neutral-700'
                }`}
              >
                <Filter size={16} />
                <span>{selectedMember ? selectedMember.name : 'Filtrar'}</span>

                {selectedMember && (
                  <X
                    size={14}
                    onClick={(e) => {
                      e.stopPropagation()
                      onMemberFilter(null)
                    }}
                  />
                )}
              </button>

              {showFilterMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
                  <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 w-60">

                    <button
                      onClick={() => {
                        onMemberFilter(null)
                        setShowFilterMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-50"
                    >
                      <Users size={16} className="inline mr-2" />
                      Todas las tareas
                    </button>

                    <div className="border-t my-2" />

                    {teamMembers.map(member => (
                      <button
                        key={member.id}
                        onClick={() => {
                          onMemberFilter(member)
                          setShowFilterMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-neutral-50"
                      >
                        {member.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Nueva tarea */}
          {(currentView === 'board' || currentView === 'list') && (
            <button
              onClick={onAddTask}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Plus size={16} className="inline mr-1" />
              Nueva Tarea
            </button>
          )}

          {/* Notificaciones */}
          <button onClick={onNotificationClick} className="relative">
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TopBar

