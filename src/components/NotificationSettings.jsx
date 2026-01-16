import { Bell, BellOff, Check, X } from 'lucide-react'
import { useState, useEffect } from 'react'

function NotificationSettings({ onClose, onToggleNotifications, notificationsEnabled }) {
  const [permission, setPermission] = useState(Notification.permission)

  useEffect(() => {
    // Actualizar estado del permiso
    setPermission(Notification.permission)
  }, [])

  const handleRequestPermission = async () => {
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        onToggleNotifications(true)
        
        // Mostrar notificación de prueba
        new Notification('MPFlow', {
          body: '¡Notificaciones activadas correctamente! 🎉',
          icon: '/favicon.ico',
          tag: 'test'
        })
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error)
    }
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return {
          icon: <Check size={20} className="text-green-600" />,
          text: 'Permisos otorgados',
          color: 'text-green-600',
          bg: 'bg-green-50'
        }
      case 'denied':
        return {
          icon: <X size={20} className="text-red-600" />,
          text: 'Permisos denegados',
          color: 'text-red-600',
          bg: 'bg-red-50'
        }
      default:
        return {
          icon: <Bell size={20} className="text-amber-600" />,
          text: 'Permisos pendientes',
          color: 'text-amber-600',
          bg: 'bg-amber-50'
        }
    }
  }

  const status = getPermissionStatus()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Bell className="text-primary-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  Notificaciones de Escritorio
                </h2>
                <p className="text-sm text-neutral-600 mt-0.5">
                  Recibe recordatorios de tus tareas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Estado actual */}
          <div className={`p-4 rounded-lg ${status.bg} border-2 ${status.color.replace('text-', 'border-')}`}>
            <div className="flex items-center space-x-3">
              {status.icon}
              <div>
                <p className={`font-semibold ${status.color}`}>
                  {status.text}
                </p>
                <p className="text-xs text-neutral-600 mt-1">
                  {permission === 'granted' && 'Recibirás notificaciones cuando tengas tareas pendientes'}
                  {permission === 'denied' && 'Debes permitir notificaciones en la configuración del navegador'}
                  {permission === 'default' && 'Haz clic en el botón de abajo para activar las notificaciones'}
                </p>
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-neutral-900">
              ¿Qué notificaciones recibirás?
            </p>
            
            <div className="space-y-2">
              <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                <div className="p-1 bg-primary-100 rounded-lg mt-0.5">
                  <Bell size={14} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Tareas del día
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Te avisaremos cada mañana sobre tus tareas pendientes para hoy
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                <div className="p-1 bg-red-100 rounded-lg mt-0.5">
                  <Bell size={14} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Tareas vencidas
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Recibirás recordatorios si tienes tareas vencidas sin completar
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                <div className="p-1 bg-amber-100 rounded-lg mt-0.5">
                  <Bell size={14} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Recordatorios periódicos
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Cada 4 horas te recordaremos las tareas pendientes del día
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Horario */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>Horario:</strong> Recibirás la primera notificación a las 9:00 AM y recordatorios cada 4 horas durante el día laboral.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-200 bg-neutral-50 space-y-3">
          {permission === 'granted' ? (
            <>
              <button
                onClick={() => {
                  onToggleNotifications(!notificationsEnabled)
                  onClose()
                }}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  notificationsEnabled
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {notificationsEnabled ? (
                  <>
                    <BellOff size={18} />
                    <span>Desactivar Notificaciones</span>
                  </>
                ) : (
                  <>
                    <Bell size={18} />
                    <span>Activar Notificaciones</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </>
          ) : permission === 'denied' ? (
            <>
              <div className="text-center text-sm text-neutral-600 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-semibold text-red-900 mb-2">Permisos bloqueados</p>
                <p className="text-xs">
                  Para activar las notificaciones, ve a la configuración de tu navegador y permite notificaciones para este sitio.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRequestPermission}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <Bell size={18} />
                <span>Activar Notificaciones</span>
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Ahora no
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationSettings
