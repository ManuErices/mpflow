import { LayoutGrid, List, Calendar as CalendarIcon, UserCircle, Plus, Bell, BellRing, AlertCircle, Filter, X, Users, MessageCircle } from 'lucide-react'
import { useState } from 'react'

function TopBar({ 
  currentView, 
  onViewChange, 
  onAddTask,
  notificationCount,
  onNotificationClick,
  unreadMessagesCount,
  onMessagesClick,
  teamMembers = [],
  selectedMember,
  onMemberFilter,
  onOpenNotificationSettings,
  notificationsEnabled
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
        {/* Left: Navigation Tabs */}
        <div className="flex items-center space-x-1 flex-1 overflow-x-auto scrollbar-hide">
          {views.map(view => {
            const Icon = view.icon
            const isActive = currentView === view.id
            
            return (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{view.label}</span>
              </button>
            )
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 ml-4">
          {/* Filtro por Persona */}
          {(currentView === 'board' || currentView === 'list') && (
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  selectedMember 
                    ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                <Filter size={16} />
                <span className="hidden md:inline">
                  {selectedMember ? selectedMember.name : 'Filtrar'}
                </span>
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

              {/* Dropdown Menu */}
              {showFilterMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowFilterMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50 min-w-[240px]">
                    <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase">
                      Filtrar por
                    </div>
                    
                    <button
                      onClick={() => {
                        onMemberFilter(null)
                        setShowFilterMenu(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 hover:bg-neutral-50 transition-colors ${
                        !selectedMember ? 'bg-primary-50 text-primary-700' : 'text-neutral-700'
                      }`}
                    >
                      <Users size={16} />
                      <span className="text-sm font-medium">Todas las tareas</span>
                    </button>

                    <div className="border-t border-neutral-200 my-2"></div>

                    {teamMembers.length === 0 ? (
                      <div className="px-3 py-4 text-center">
                        <p className="text-xs text-neutral-500">No hay miembros</p>
                        <p className="text-xs text-neutral-400 mt-1">Agrega miembros en la vista Equipo</p>
                      </div>
                    ) : (
                      teamMembers.map(member => (
                        <button
                          key={member.id}
                          onClick={() => {
                            onMemberFilter(member)
                            setShowFilterMenu(false)
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 hover:bg-neutral-50 transition-colors ${
                            selectedMember?.id === member.id ? 'bg-primary-50' : ''
                          }`}
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                            <span className="text-white text-[10px] font-semibold">
                              {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-neutral-900">{member.name}</p>
                            {member.role && (
                              <p className="text-xs text-neutral-500">{member.role}</p>
                            )}
                          </div>
                          {selectedMember?.id === member.id && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Add Task Button */}
          {(currentView === 'board' || currentView === 'list') && (
            <button
              onClick={onAddTask}
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Nueva Tarea</span>
            </button>
          )}

          {/* Messages */}
          <button
            onClick={onMessagesClick}
            className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Mensajes"
          >
            <MessageCircle size={20} className="text-neutral-600" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Notifications (in-app) */}
          <button
            onClick={onNotificationClick}
            className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Notificaciones"
          >
            <Bell size={20} className="text-neutral-600" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Desktop Notifications Settings */}
          <button
            onClick={onOpenNotificationSettings}
            className={`p-2 rounded-lg transition-all relative ${
              notificationsEnabled 
                ? 'hover:bg-emerald-50 bg-emerald-100 border border-emerald-300' 
                : 'hover:bg-amber-50 bg-amber-100 border border-amber-300 animate-pulse'
            }`}
            title={notificationsEnabled ? "Notificaciones de escritorio activas ✓" : "⚠️ Activar notificaciones de escritorio"}
          >
            {notificationsEnabled ? (
              <BellRing size={20} className="text-emerald-600" />
            ) : (
              <AlertCircle size={20} className="text-amber-600" />
            )}
            {notificationsEnabled && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full shadow-lg"></span>
            )}
            {!notificationsEnabled && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TopBar
