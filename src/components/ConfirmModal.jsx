import { AlertTriangle } from 'lucide-react'

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Eliminar', type = 'danger' }) {
  if (!isOpen) return null

  const styles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'text-red-600',
      bg: 'bg-red-50'
    },
    warning: {
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  }

  const style = styles[type]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-large w-full max-w-sm mx-auto animate-scale-in">
        <div className="p-5">
          <div className={`w-12 h-12 ${style.bg} rounded-full flex items-center justify-center mb-4`}>
            <AlertTriangle className={style.icon} size={24} />
          </div>
          
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-neutral-600 mb-6">
            {message}
          </p>

          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${style.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
