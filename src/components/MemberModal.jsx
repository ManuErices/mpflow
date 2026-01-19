import { X, User, Mail, Phone, Briefcase } from 'lucide-react'
import { useState, useEffect } from 'react'

function MemberModal({ isOpen, onClose, onSave, member }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    avatar: '',
    userId: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        role: member.role || '',
        email: member.email || '',
        phone: member.phone || '',
        avatar: member.avatar || '',
        userId: member.userId || ''
      })
    } else {
      setFormData({
        name: '',
        role: 'Colaborador',
        email: '',
        phone: '',
        avatar: '',
        userId: ''
      })
    }
    setErrors({})
  }, [member, isOpen])

  const roleOptions = [
    'Gerente de Administración',
    'Jefa de Administración y RRHH',
    'Jefa de Oficina Técnica',
    'Jefe de Contabilidad',
    'Ejecutivo de Venta',
    'Jefe de Operaciones',
    'Ayudante Administrativo',
  ]

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) return

    const memberData = {
      ...formData,
      name: formData.name.trim(),
      role: formData.role || 'Colaborador',
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      avatar: formData.avatar || formData.name.trim().split(' ').map(n => n[0]).join('')
    }

    onSave(memberData)
    onClose()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-large w-full max-w-md mx-auto animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">
            {member ? 'Editar Miembro' : 'Nuevo Miembro'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">
                {formData.name ? formData.name.split(' ').map(n => n[0]).join('').substring(0, 2) : '?'}
              </span>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Nombre Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Fabián Erices"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-neutral-300 focus:ring-primary-500'
                }`}
              />
            </div>
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Rol / Especialidad
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              >
                {roleOptions.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@empresa.cl"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-neutral-300 focus:ring-primary-500'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Teléfono
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          {/* User ID (Email del usuario registrado) - NUEVO */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Email de Usuario Registrado (para chat) 💬
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="email"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="email@ejemplo.com (debe estar registrado)"
                className="w-full pl-10 pr-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
              />
            </div>
            <p className="text-xs text-blue-700 mt-1.5">
              ⚠️ Este email debe estar registrado en la aplicación para poder enviar/recibir mensajes.
            </p>
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
              {member ? 'Guardar Cambios' : 'Agregar Miembro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MemberModal
