import { X, Calendar as CalendarIcon, User, Flag, CheckSquare, Plus, Trash2, Clock, UserCheck, Users, Repeat } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import FileAttachments from './FileAttachments'
import { uploadMultipleFiles, deleteFile } from '../utils/storageHelper'

function TaskModal({ isOpen, onClose, onSave, task, projects, currentProject, teamMembers = [] }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignees: [],
    dueDate: '',
    dueTime: '',
    tags: [],
    projectId: currentProject?.id || '',
    status: 'todo',
    checklist: [],
    attachments: [],
    requestedBy: user?.displayName || user?.email || 'Usuario',
    requestedById: user?.uid,
    isRecurring: false, // NUEVO
    recurrence: { // NUEVO
      type: 'monthly', // monthly, yearly
      dayOfMonth: 1, // Día del mes (1-31)
      monthsInterval: 1, // Cada cuántos meses
      enabled: true
    }
  })

  const [newTag, setNewTag] = useState('')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [errors, setErrors] = useState({})
  const [attachments, setAttachments] = useState([])

  useEffect(() => {
    if (task) {
      // Compatibilidad con tareas antiguas que usan 'assignee' (string)
      let assigneesArray = []
      if (task.assignees && Array.isArray(task.assignees)) {
        assigneesArray = task.assignees
      } else if (task.assignee) {
        assigneesArray = [task.assignee]
      }

      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        assignees: assigneesArray,
        dueDate: task.dueDate || '',
        dueTime: task.dueTime || '',
        tags: task.tags || [],
        projectId: task.projectId || currentProject?.id || '',
        status: task.status || 'todo',
        checklist: task.checklist?.items || [],
        attachments: task.attachments || [],
        requestedBy: task.requestedBy || user?.displayName || user?.email || 'Usuario',
        requestedById: task.requestedById || user?.uid,
        isRecurring: task.isRecurring || false,
        recurrence: task.recurrence || {
          type: 'monthly',
          dayOfMonth: 1,
          monthsInterval: 1,
          enabled: true
        }
      })
      setAttachments(task.attachments || [])
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assignees: [],
        dueDate: '',
        dueTime: '',
        tags: [],
        projectId: currentProject?.id || '',
        status: 'todo',
        checklist: [],
        attachments: [],
        requestedBy: user?.displayName || user?.email || 'Usuario',
        requestedById: user?.uid,
        isRecurring: false,
        recurrence: {
          type: 'monthly',
          dayOfMonth: 1,
          monthsInterval: 1,
          enabled: true
        }
      })
      setAttachments([])
    }
    setErrors({})
  }, [task, isOpen, currentProject, user])

  const priorityOptions = [
    { value: 'low', label: 'Baja', color: 'bg-blue-100 text-blue-700' },
    { value: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-700' }
  ]

  const statusOptions = [
    { value: 'todo', label: 'Por Hacer' },
    { value: 'in-progress', label: 'En Progreso' },
    { value: 'review', label: 'En Revisión' },
    { value: 'done', label: 'Completado' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // NUEVO: Manejar cambios en recurrencia
  const handleRecurrenceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        [field]: value
      }
    }))
  }

  // NUEVO: Toggle recurrencia
  const handleToggleRecurring = () => {
    setFormData(prev => ({
      ...prev,
      isRecurring: !prev.isRecurring
    }))
  }

  // Manejar selección/deselección de asignados
  const handleToggleAssignee = (memberName) => {
    setFormData(prev => {
      const isSelected = prev.assignees.includes(memberName)
      if (isSelected) {
        return {
          ...prev,
          assignees: prev.assignees.filter(name => name !== memberName)
        }
      } else {
        return {
          ...prev,
          assignees: [...prev.assignees, memberName]
        }
      }
    })
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData(prev => ({
        ...prev,
        checklist: [...prev.checklist, { text: newChecklistItem.trim(), completed: false }]
      }))
      setNewChecklistItem('')
    }
  }

  const handleToggleChecklistItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item
      )
    }))
  }

  const handleRemoveChecklistItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index)
    }))
  }

  const handleUploadFiles = async (files) => {
    try {
      const uploadedFiles = await uploadMultipleFiles(files, user.uid)
      setAttachments(prev => [...prev, ...uploadedFiles])
    } catch (error) {
      console.error('Error al subir archivos:', error)
      alert('Error al subir archivos. Por favor intenta de nuevo.')
    }
  }

  const handleDeleteFile = async (fileId) => {
    try {
      const file = attachments.find(f => f.id === fileId)
      if (!file) return
      
      await deleteFile(file.path)
      setAttachments(prev => prev.filter(f => f.id !== fileId))
    } catch (error) {
      console.error('Error al eliminar archivo:', error)
      alert('Error al eliminar archivo')
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio'
    }
    
    if (!formData.projectId) {
      newErrors.projectId = 'Debes seleccionar un proyecto'
    }

    // Validar recurrencia si está activada
    if (formData.isRecurring) {
      if (!formData.dueTime) {
        newErrors.dueTime = 'La hora es obligatoria para tareas recurrentes'
      }
      if (formData.recurrence.dayOfMonth < 1 || formData.recurrence.dayOfMonth > 31) {
        newErrors.recurrence = 'El día debe estar entre 1 y 31'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    const checklistData = {
      items: formData.checklist,
      completed: formData.checklist.filter(item => item.completed).length,
      total: formData.checklist.length
    }

    onSave({
      ...formData,
      checklist: checklistData,
      attachments,
      assignees: formData.assignees,
      assignee: formData.assignees.length > 0 ? formData.assignees[0] : '',
      requestedBy: formData.requestedBy,
      requestedById: formData.requestedById,
      isRecurring: formData.isRecurring,
      recurrence: formData.isRecurring ? formData.recurrence : null,
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-large w-full max-w-2xl my-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              {task ? 'Editar Tarea' : 'Nueva Tarea'}
            </h2>
            {!task && (
              <p className="text-xs text-neutral-500 mt-1 flex items-center space-x-1">
                <UserCheck size={12} />
                <span>Solicitada por: {formData.requestedBy}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Título *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ej: Pago de remuneraciones"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
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
              onChange={handleInputChange}
              rows="3"
              placeholder="Detalles de la tarea..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-all"
            />
          </div>

          {/* NUEVO: Toggle Tarea Recurrente */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Repeat className="text-purple-600" size={18} />
                <div>
                  <label className="text-sm font-semibold text-neutral-900">
                    Tarea Recurrente
                  </label>
                  <p className="text-xs text-neutral-600">
                    Se creará automáticamente cada mes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleRecurring}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isRecurring ? 'bg-purple-600' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isRecurring ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Configuración de Recurrencia */}
            {formData.isRecurring && (
              <div className="space-y-3 pt-3 border-t border-purple-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Día del mes *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.recurrence.dayOfMonth}
                      onChange={(e) => handleRecurrenceChange('dayOfMonth', parseInt(e.target.value))}
                      className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.recurrence && <p className="text-xs text-red-600 mt-1">{errors.recurrence}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Cada (meses)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.recurrence.monthsInterval}
                      onChange={(e) => handleRecurrenceChange('monthsInterval', parseInt(e.target.value))}
                      className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <p className="text-xs text-neutral-600">
                    📅 Esta tarea se creará automáticamente el día <strong>{formData.recurrence.dayOfMonth}</strong> de cada{' '}
                    {formData.recurrence.monthsInterval > 1 ? `${formData.recurrence.monthsInterval} meses` : 'mes'}
                    {formData.dueTime && ` a las ${formData.dueTime}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Proyecto */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Proyecto *
            </label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.projectId 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-neutral-300 focus:ring-primary-500'
              }`}
            >
              <option value="">Selecciona un proyecto</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && <p className="text-xs text-red-600 mt-1">{errors.projectId}</p>}
          </div>

          {/* Prioridad y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                <Flag size={14} className="inline mr-1" />
                Prioridad
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Asignar a (Múltiples personas) */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <Users size={14} className="inline mr-1" />
              Asignar a {formData.assignees.length > 0 && `(${formData.assignees.length})`}
            </label>
            
            {teamMembers.length === 0 ? (
              <p className="text-sm text-neutral-500 p-3 bg-neutral-50 rounded-lg">
                Agrega miembros al equipo para poder asignar tareas
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-neutral-200 rounded-lg bg-neutral-50">
                {teamMembers.map(member => {
                  const isSelected = formData.assignees.includes(member.name)
                  
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleToggleAssignee(member.name)}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-primary-100 border-2 border-primary-500'
                          : 'bg-white border-2 border-transparent hover:border-neutral-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-primary-600' : 'bg-gradient-to-br from-neutral-400 to-neutral-500'
                      }`}>
                        <span className="text-white text-xs font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-neutral-900">{member.name}</p>
                        {member.role && (
                          <p className="text-xs text-neutral-500">{member.role}</p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                          <CheckSquare size={14} className="text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Fecha y Hora límite */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                <CalendarIcon size={14} className="inline mr-1" />
                Fecha límite {!formData.isRecurring && '(opcional)'}
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                disabled={formData.isRecurring}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              />
              {formData.isRecurring && (
                <p className="text-xs text-neutral-500 mt-1">Se calcula automáticamente</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                <Clock size={14} className="inline mr-1" />
                Hora límite {formData.isRecurring && '*'}
              </label>
              <input
                type="time"
                name="dueTime"
                value={formData.dueTime}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.dueTime 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-neutral-300 focus:ring-primary-500'
                }`}
              />
              {errors.dueTime && <p className="text-xs text-red-600 mt-1">{errors.dueTime}</p>}
            </div>
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Etiquetas
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Nueva etiqueta"
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-neutral-100 text-neutral-700 rounded-md text-xs"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              <CheckSquare size={14} className="inline mr-1" />
              Lista de verificación
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistItem())}
                placeholder="Nueva tarea"
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {formData.checklist.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-neutral-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleChecklistItem(index)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className={`flex-1 text-sm ${item.completed ? 'line-through text-neutral-500' : 'text-neutral-900'}`}>
                    {item.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Archivos Adjuntos */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Archivos Adjuntos
            </label>
            <FileAttachments
              files={attachments}
              onUpload={handleUploadFiles}
              onDelete={handleDeleteFile}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-5 border-t border-neutral-200 bg-neutral-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            {task ? 'Actualizar' : 'Crear'} Tarea
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskModal
