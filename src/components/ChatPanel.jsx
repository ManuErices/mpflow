import { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle, Search, Paperclip, ChevronLeft, Link as LinkIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import TaskReferenceModal from './TaskReferenceModal'

function ChatPanel({ isOpen, onClose, teamMembers, tasks, onSendMessage, conversations = {} }) {
  const { user } = useAuth()
  const [selectedMember, setSelectedMember] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showTaskReferenceModal, setShowTaskReferenceModal] = useState(false)
  const messagesEndRef = useRef(null)

  const currentUserName = user?.displayName || user?.email || ''

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversations, selectedMember])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Obtener conversación con un miembro específico
  const getConversationWith = (memberName) => {
    return conversations[memberName] || []
  }

  // Contar mensajes no leídos por miembro
  const getUnreadCount = (memberName) => {
    const conv = conversations[memberName] || []
    return conv.filter(msg => !msg.read && msg.sender !== currentUserName).length
  }

  // Obtener último mensaje de cada conversación
  const getLastMessage = (memberName) => {
    const conv = conversations[memberName] || []
    if (conv.length === 0) return null
    return conv[conv.length - 1]
  }

  // Filtrar miembros por búsqueda
  const filteredMembers = teamMembers.filter(member => {
    if (member.name === currentUserName) return false
    if (!searchQuery) return true
    return member.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Ordenar miembros por última actividad
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const lastMsgA = getLastMessage(a.name)
    const lastMsgB = getLastMessage(b.name)
    if (!lastMsgA && !lastMsgB) return 0
    if (!lastMsgA) return 1
    if (!lastMsgB) return -1
    return new Date(lastMsgB.timestamp) - new Date(lastMsgA.timestamp)
  })

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedMember) return

    const message = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      sender: currentUserName,
      senderId: user?.uid,
      receiver: selectedMember.name,
      text: messageText.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      taskReference: null
    }

    onSendMessage(selectedMember.name, message)
    setMessageText('')
    scrollToBottom()
  }

  const handleTaskReference = (task) => {
    if (!task || !selectedMember) return

    const message = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      sender: currentUserName,
      senderId: user?.uid,
      receiver: selectedMember.name,
      text: `📋 Referencia a tarea: "${task.title}"`,
      timestamp: new Date().toISOString(),
      read: false,
      taskReference: {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority
      }
    }

    onSendMessage(selectedMember.name, message)
    scrollToBottom()
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    if (diffDays < 7) return date.toLocaleDateString('es-ES', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const statusConfig = {
    'todo': { label: 'Por Hacer', color: 'bg-neutral-500' },
    'in-progress': { label: 'En Progreso', color: 'bg-primary-600' },
    'review': { label: 'Revisión', color: 'bg-blue-500' },
    'done': { label: 'Completado', color: 'bg-emerald-500' }
  }

  const priorityConfig = {
    high: { label: 'Alta', color: 'text-red-600' },
    medium: { label: 'Media', color: 'text-amber-600' },
    low: { label: 'Baja', color: 'text-emerald-600' }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-large w-full max-w-5xl h-[600px] flex animate-scale-in">
        
        {/* Sidebar - Lista de contactos */}
        <div className={`w-80 border-r border-neutral-200 flex flex-col ${selectedMember ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center space-x-2">
                <MessageCircle size={20} />
                <span>Mensajes</span>
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-neutral-500" />
              </button>
            </div>

            {/* Buscador */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar contacto..."
                className="w-full pl-10 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Lista de contactos */}
          <div className="flex-1 overflow-y-auto">
            {sortedMembers.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle size={48} className="mx-auto text-neutral-300 mb-2" />
                <p className="text-sm text-neutral-600">No hay contactos</p>
                <p className="text-xs text-neutral-400 mt-1">Agrega miembros al equipo</p>
              </div>
            ) : (
              sortedMembers.map(member => {
                const lastMsg = getLastMessage(member.name)
                const unreadCount = getUnreadCount(member.name)
                const isSelected = selectedMember?.id === member.id

                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`w-full p-4 flex items-center space-x-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 ${
                      isSelected ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{unreadCount}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm text-neutral-900 truncate">
                          {member.name}
                        </h3>
                        {lastMsg && (
                          <span className="text-xs text-neutral-500 ml-2">
                            {formatTime(lastMsg.timestamp)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
                        {member.role || 'Miembro del equipo'}
                      </p>
                      {lastMsg && (
                        <p className={`text-xs truncate mt-1 ${unreadCount > 0 ? 'font-semibold text-neutral-900' : 'text-neutral-600'}`}>
                          {lastMsg.sender === currentUserName ? 'Tú: ' : ''}{lastMsg.text}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Área de chat */}
        <div className="flex-1 flex flex-col">
          {!selectedMember ? (
            <div className="flex-1 flex items-center justify-center bg-neutral-50">
              <div className="text-center">
                <MessageCircle size={64} className="mx-auto text-neutral-300 mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Selecciona un contacto
                </h3>
                <p className="text-sm text-neutral-600">
                  Elige a alguien del equipo para iniciar una conversación
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header del chat */}
              <div className="p-4 border-b border-neutral-200 flex items-center space-x-3">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} className="text-neutral-600" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {selectedMember.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900">{selectedMember.name}</h3>
                  <p className="text-xs text-neutral-500">{selectedMember.role || 'Miembro del equipo'}</p>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
                {getConversationWith(selectedMember.name).length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle size={48} className="mx-auto text-neutral-300 mb-3" />
                    <p className="text-neutral-600 font-medium">No hay mensajes aún</p>
                    <p className="text-sm text-neutral-500 mt-1">Inicia la conversación</p>
                  </div>
                ) : (
                  getConversationWith(selectedMember.name).map((message) => {
                    const isOwn = message.sender === currentUserName
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                          {/* Referencia a tarea */}
                          {message.taskReference && (
                            <div className="mb-2 p-3 bg-white rounded-lg border-l-4 border-primary-500 shadow-sm">
                              <div className="flex items-start space-x-2">
                                <LinkIcon size={14} className="text-primary-600 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-primary-700 mb-1">
                                    Tarea referenciada
                                  </p>
                                  <p className="text-sm font-medium text-neutral-900 mb-1">
                                    {message.taskReference.title}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-xs px-2 py-0.5 rounded ${priorityConfig[message.taskReference.priority]?.color || 'text-neutral-600'}`}>
                                      {priorityConfig[message.taskReference.priority]?.label || 'N/A'}
                                    </span>
                                    <div className="flex items-center space-x-1">
                                      <div className={`w-2 h-2 rounded-full ${statusConfig[message.taskReference.status]?.color}`}></div>
                                      <span className="text-xs text-neutral-600">
                                        {statusConfig[message.taskReference.status]?.label}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Mensaje */}
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-primary-600 text-white rounded-tr-none'
                                : 'bg-white text-neutral-900 rounded-tl-none shadow-sm'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.text}
                            </p>
                          </div>

                          {/* Timestamp */}
                          <p className={`text-xs text-neutral-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensaje */}
              <div className="p-4 border-t border-neutral-200 bg-white">
                <form onSubmit={handleSendMessage} className="space-y-2">
                  <div className="flex items-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowTaskReferenceModal(true)}
                      className="p-3 border border-neutral-300 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors"
                      title="Referenciar tarea"
                    >
                      <LinkIcon size={20} />
                    </button>
                    <div className="flex-1">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage(e)
                          }
                        }}
                        placeholder="Escribe un mensaje..."
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        rows={2}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 px-1">
                    Presiona Enter para enviar, Shift + Enter para nueva línea
                  </p>
                </form>

                {/* Modal de referencia de tareas */}
                <TaskReferenceModal
                  isOpen={showTaskReferenceModal}
                  onClose={() => setShowTaskReferenceModal(false)}
                  tasks={tasks}
                  onSelectTask={handleTaskReference}
                  selectedMember={selectedMember}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPanel
