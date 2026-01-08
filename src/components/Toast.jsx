import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useEffect } from 'react'

function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const types = {
    success: {
      icon: CheckCircle,
      bg: 'bg-emerald-50',
      border: 'border-emerald-500',
      text: 'text-emerald-800',
      iconColor: 'text-emerald-600'
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-800',
      iconColor: 'text-red-600'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-800',
      iconColor: 'text-blue-600'
    }
  }

  const config = types[type]
  const Icon = config.icon

  return (
    <div className={`${config.bg} ${config.text} border-l-4 ${config.border} p-4 rounded-lg shadow-lg animate-slide-up flex items-start space-x-3 min-w-[300px] max-w-md`}>
      <Icon className={config.iconColor} size={20} strokeWidth={2} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="p-0.5 hover:bg-black/5 rounded transition-colors">
        <X size={16} />
      </button>
    </div>
  )
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 z-[60] space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  )
}

export { Toast, ToastContainer }
