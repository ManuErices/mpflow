import { X, Calendar as CalendarIcon, User, Flag, CheckSquare, Plus, Trash2, Clock, UserCheck, Users } from 'lucide-react'
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
    assignees: [], // Cambiado de assignee a assignees (array)
    dueDate: '',
    dueTime: '',
    tags: [],
    projectId: currentProject?.id || '',
    status: 'todo',
    checklist: [],
    attachments: [],
    requestedBy: user?.displayName || user?.email || 'Usuario',
    requestedById: user?.uid
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
        requestedById: task.requestedById || user?.uid
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
        requestedById: user?.uid
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
      assignees: formData.assignees, // Guardar como array
      // Mantener compatibilidad con código antiguo
      assignee: formData.assignees.length > 0 ? formData.assignees[0] : '',
      requestedBy: formData.requestedBy,
      requestedById: formData.requestedById,
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
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ej: Instalar columnas de soporte"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                errors.title ? 'border-red-500' : 'border-neutral-300'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
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
              rows={3}
              placeholder="Describe los detalles de la tarea..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
            />
          </div>

          {/* Proyecto y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Proyecto <span className="text-red-500">*</span>
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                  errors.projectId ? 'border-red-500' : 'border-neutral-300'
                }`}
              >
                <option value="">Seleccionar...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
              )}
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

          {/* Prioridad */}
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
                Fecha límite
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                <Clock size={14} className="inline mr-1" />
                Hora límite
              </label>
              <input
                type="time"
                name="dueTime"
                value={formData.dueTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
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
                placeholder="Agregar etiqueta..."
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                <Plus size={16} />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary-900"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Lista de verificación */}
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
                placeholder="Agregar elemento..."
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                <Plus size={16} />
              </button>
            </div>
            {formData.checklist.length > 0 && (
              <div className="space-y-2">
                {formData.checklist.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 bg-neutral-50 rounded-lg group"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklistItem(index)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span className={`flex-1 text-sm ${item.completed ? 'line-through text-neutral-500' : 'text-neutral-700'}`}>
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(index)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                    >
                      <Trash2 size={14} className="text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Archivos Adjuntos */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Archivos Adjuntos
            </label>
            <FileAttachments
              attachments={attachments}
              onUpload={handleUploadFiles}
              onDelete={handleDeleteFile}
              maxSize={10}
            />
          </div>

          {/* Solicitante (solo lectura cuando edita) */}
          {task && (
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center space-x-2 text-sm text-neutral-600">
                <UserCheck size={16} className="text-neutral-400" />
                <span>Solicitada por: <span className="font-medium text-neutral-900">{task.requestedBy || 'Usuario'}</span></span>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-5 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
          >
            {task ? 'Guardar Cambios' : 'Crear Tarea'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskModal
