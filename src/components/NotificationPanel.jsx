import { useState, useEffect } from 'react'
import { Bell, X, Check, CheckCheck, Trash2, Calendar, AlertCircle, User, Folder } from 'lucide-react'

function NotificationPanel({ isOpen, onClose, notifications = [], onMarkAsRead, onMarkAllAsRead, onDelete }) {
  if (!isOpen) return null

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task': return Calendar
      case 'deadline': return AlertCircle
      case 'assignment': return User
      case 'project': return Folder
      default: return Bell
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-600'
      case 'deadline': return 'bg-red-100 text-red-600'
      case 'assignment': return 'bg-primary-100 text-primary-600'
      case 'project': return 'bg-emerald-100 text-emerald-600'
      default: return 'bg-neutral-100 text-neutral-600'
    }
  }

  const formatTime = (date) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffMs = now - notifDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins}m`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return notifDate.toLocaleDateString('es-ES')
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-14 right-0 left-0 sm:left-auto sm:right-4 w-full sm:w-96 max-h-[600px] bg-white rounded-none sm:rounded-xl shadow-large border-t sm:border border-neutral-200 z-50 animate-slide-up flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Bell size={20} className="text-neutral-700" />
              <h3 className="font-semibold text-neutral-900">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
              <X size={18} className="text-neutral-500" />
            </button>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                <CheckCheck size={14} />
                <span>Marcar todas como leídas</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell size={48} className="mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-600 text-sm">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                const colorClass = getNotificationColor(notification.type)

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-neutral-50 transition-colors ${
                      !notification.read ? 'bg-primary-50/30' : ''
                    }`}
                  >
                    <div className="flex space-x-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} strokeWidth={2} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm text-neutral-900 font-medium">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 ml-2 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-500">
                            {formatTime(notification.date)}
                          </span>
                          <div className="flex items-center space-x-1">
                            {!notification.read && (
                              <button
                                onClick={() => onMarkAsRead(notification.id)}
                                className="p-1 hover:bg-neutral-200 rounded transition-colors"
                                title="Marcar como leída"
                              >
                                <Check size={14} className="text-neutral-600" />
                              </button>
                            )}
                            <button
                              onClick={() => onDelete(notification.id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={14} className="text-red-600" />
                            </button>
                          </div>
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
    </>
  )
}

export default NotificationPanel
