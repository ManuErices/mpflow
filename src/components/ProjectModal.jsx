import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

function ProjectModal({ isOpen, onClose, onSave, project }) {
  const [formData, setFormData] = useState({
    name: '',
    status: 'Planificación',
    color: '#9333ea',
    description: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        status: project.status || 'Planificación',
        color: project.color || '#9333ea',
        description: project.description || '',
      })
    } else {
      setFormData({
        name: '',
        status: 'Planificación',
        color: '#9333ea',
        description: '',
      })
    }
    setErrors({})
  }, [project, isOpen])

  const statusOptions = [
    'Planificación',
    'En Progreso',
    'En Pausa',
    'Completado',
    'Cancelado'
  ]

  const colorOptions = [
    { name: 'Morado', value: '#9333ea' },
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Verde', value: '#10b981' },
    { name: 'Naranja', value: '#f59e0b' },
    { name: 'Rojo', value: '#ef4444' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Índigo', value: '#6366f1' },
  ]

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    const projectData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
    }

    onSave(projectData)
    onClose()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-large w-full max-w-md mx-auto animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">
            {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Edificio Residencial Centro"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Descripción (opcional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Breve descripción del proyecto..."
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`w-8 h-8 rounded-lg transition-all hover:scale-110 ${
                    formData.color === color.value
                      ? 'ring-2 ring-offset-2 ring-primary-600'
                      : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
            >
              {project ? 'Guardar Cambios' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectModal
