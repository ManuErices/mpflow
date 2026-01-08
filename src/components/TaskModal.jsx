import { X, Calendar as CalendarIcon, User, Flag, CheckSquare, Plus, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

function TaskModal({ isOpen, onClose, onSave, task, projects, currentProject }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    tags: [],
    projectId: currentProject?.id || '',
    status: 'todo',
    checklist: []
  })

  const [newTag, setNewTag] = useState('')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        assignee: task.assignee || '',
        dueDate: task.dueDate || '',
        tags: task.tags || [],
        projectId: task.projectId || currentProject?.id || '',
        status: task.status || 'todo',
        checklist: task.checklist?.items || []
      })
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assignee: '',
        dueDate: '',
        tags: [],
        projectId: currentProject?.id || '',
        status: 'todo',
        checklist: []
      })
    }
    setErrors({})
  }, [task, isOpen, currentProject])

  const priorityOptions = [
    { value: 'low', label: 'Baja', color: 'bg-emerald-500' },
    { value: 'medium', label: 'Media', color: 'bg-amber-500' },
    { value: 'high', label: 'Alta', color: 'bg-red-500' }
  ]

  const statusOptions = [
    { value: 'todo', label: 'Por Hacer' },
    { value: 'in-progress', label: 'En Progreso' },
    { value: 'review', label: 'Revisión' },
    { value: 'done', label: 'Completado' }
  ]

  const validate = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio'
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Debes seleccionar un proyecto'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) return

    const taskData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      checklist: formData.checklist.length > 0 ? {
        completed: formData.checklist.filter(item => item.completed).length,
        total: formData.checklist.length,
        items: formData.checklist
      } : null
    }

    onSave(taskData)
    onClose()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData(prev => ({
        ...prev,
        checklist: [...prev.checklist, { text: newChecklistItem.trim(), completed: false }]
      }))
      setNewChecklistItem('')
    }
  }

  const toggleChecklistItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.map((item, i) => 
        i === index ? { ...item, completed: !item.completed } : item
      )
    }))
  }

  const removeChecklistItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index)
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-large w-full max-w-2xl my-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">
            {task ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Título *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Instalación eléctrica primer piso"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-neutral-300 focus:ring-primary-500'
              }`}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe los detalles de la tarea..."
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
            />
          </div>

          {/* Proyecto y Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Proyecto *
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.projectId
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-neutral-300 focus:ring-primary-500'
                }`}
              >
                <option value="">Seleccionar proyecto</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              {errors.projectId && <p className="text-xs text-red-600 mt-1">{errors.projectId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Prioridad y Asignado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Prioridad
              </label>
              <div className="flex gap-2">
                {priorityOptions.map(priority => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                    className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.priority === priority.value
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${priority.color}`}></span>
                    <span>{priority.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Asignado a
              </label>
              <input
                type="text"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                placeholder="Nombre de la persona"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Fecha de vencimiento
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Etiquetas
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Agregar etiqueta..."
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded-md"
                  >
                    <span>{tag}</span>
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Checklist */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Lista de verificación
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                placeholder="Agregar subtarea..."
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
              <button
                type="button"
                onClick={addChecklistItem}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            {formData.checklist.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {formData.checklist.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-neutral-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(index)}
                      className="w-4 h-4 rounded border-neutral-300"
                    />
                    <span className={`flex-1 text-sm ${item.completed ? 'line-through text-neutral-500' : 'text-neutral-700'}`}>
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(index)}
                      className="p-1 hover:bg-neutral-200 rounded transition-colors"
                    >
                      <Trash2 size={14} className="text-neutral-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              {task ? 'Guardar Cambios' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal
