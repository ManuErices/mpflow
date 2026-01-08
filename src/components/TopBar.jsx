import { LayoutGrid, List, Calendar, Search, Bell, Plus, Menu, X } from 'lucide-react'

function TopBar({ currentView, onViewChange, onToggleSidebar, onAddTask, searchQuery, onSearchChange, notificationCount = 0, onNotificationClick }) {
  const views = [
    { id: 'board', icon: LayoutGrid, label: 'Tablero' },
    { id: 'list', icon: List, label: 'Lista' },
    { id: 'calendar', icon: Calendar, label: 'Calendario' },
  ]

  return (
    <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-3 md:px-4 sticky top-0 z-30">
      {/* Left Section */}
      <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors flex-shrink-0"
        >
          <Menu size={18} className="text-neutral-700" />
        </button>
        
        <div className="relative flex-1 max-w-xs hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-9 pr-8 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-neutral-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-neutral-200 rounded transition-colors"
            >
              <X size={14} className="text-neutral-500" />
            </button>
          )}
        </div>
      </div>

      {/* Center Section - View Switcher (Hidden on mobile) */}
      <div className="hidden lg:flex items-center space-x-1 bg-neutral-100 p-1 rounded-lg">
        {views.map((view) => {
          const Icon = view.icon
          return (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all text-sm ${
                currentView === view.id
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              <span className="font-medium">{view.label}</span>
            </button>
          )
        })}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
        <button 
          onClick={onAddTask}
          className="flex items-center space-x-1.5 px-2 md:px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Nueva</span>
        </button>
        
        <button 
          onClick={onNotificationClick}
          className="relative p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <Bell size={18} className="text-neutral-600" strokeWidth={2} />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* Mobile search button */}
        <button 
          className="sm:hidden p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
          onClick={() => {
            const searchBar = document.querySelector('.mobile-search')
            searchBar?.classList.toggle('hidden')
          }}
        >
          <Search size={18} className="text-neutral-600" />
        </button>
      </div>

      {/* Mobile Search Bar (Expandable) */}
      <div className="mobile-search hidden absolute top-14 left-0 right-0 bg-white border-b border-neutral-200 p-3 sm:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar tareas..."
            className="w-full pl-9 pr-8 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-neutral-200 rounded transition-colors"
            >
              <X size={14} className="text-neutral-500" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopBar
