import { useState, useRef, useEffect } from 'react'
import { X, Send, Paperclip, Search, ChevronDown, Minimize2, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import TaskReferenceModal from './TaskReferenceModal'
import { getUserStatus } from '../utils/presenceHelper'

function ChatPanel({ isOpen, onClose, teamMembers = [], tasks = {}, onSendMessage, onMarkAsRead, conversations = {}, presences = {} }) {
  const { user } = useAuth()
  const [selectedContact, setSelectedContact] = useState(null)
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef(null)

  const currentUserName = user?.displayName || user?.email || ''

  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversations, selectedContact, isMinimized])

  // Marcar mensajes como leídos cuando se abre una conversación
  useEffect(() => {
    if (selectedContact && onMarkAsRead && !isMinimized) {
      // Pequeño delay para asegurar que los mensajes estén visibles
      const timer = setTimeout(() => {
        onMarkAsRead(selectedContact.name)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [selectedContact, onMarkAsRead, isMinimized])

  const filteredContacts = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getUnreadCount = (contactName) => {
    const contactConversations = conversations[contactName] || []
    return contactConversations.filter(msg => !msg.read && msg.receiver === currentUserName).length
  }

  const getTotalUnread = () => {
    return Object.keys(conversations).reduce((total, contactName) => {
      return total + getUnreadCount(contactName)
    }, 0)
  }

  const getLastMessage = (contactName) => {
    const contactConversations = conversations[contactName] || []
    if (contactConversations.length === 0) return null
    return contactConversations[contactConversations.length - 1]
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return 'Ahora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim() || !selectedContact) return

    const newMessage = {
      sender: currentUserName,
      receiver: selectedContact.name,
      text: message.trim(),
      timestamp: new Date(),
      read: false
    }

    onSendMessage(selectedContact.name, newMessage)
    setMessage('')
  }

  const handleSelectTask = (task) => {
    if (!selectedContact) return

    const taskMessage = {
      sender: currentUserName,
      receiver: selectedContact.name,
      text: `📋 Tarea compartida: ${task.title}`,
      timestamp: new Date(),
      read: false,
      taskReference: {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority
      }
    }

    onSendMessage(selectedContact.name, taskMessage)
    setShowTaskModal(false)
  }

  // NUEVO: Componente para indicador de presencia
  const StatusIndicator = ({ userName, size = 'sm' }) => {
    const status = getUserStatus(presences, userName, teamMembers)
    const isOnline = status === 'online'
    
    const sizeClasses = {
      sm: 'w-2.5 h-2.5',
      md: 'w-3 h-3',
      lg: 'w-3.5 h-3.5'
    }

    return (
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} rounded-full border-2 border-white ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`}
          title={isOnline ? 'En línea' : 'Desconectado'}
        />
        {isOnline && (
          <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-green-500 animate-ping opacity-75`} />
        )}
      </div>
    )
  }

  if (!isOpen) return null

  const currentConversation = selectedContact ? (conversations[selectedContact.name] || []) : []
  const totalUnread = getTotalUnread()

  return (
    <>
      {/* Floating Chat Button (when minimized) */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-xl hover:bg-primary-700 transition-all flex items-center justify-center z-50 hover:scale-110"
        >
          <MessageCircle size={24} />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {!isMinimized && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl border border-neutral-200 z-50 flex flex-col animate-scale-in">
          {/* Header */}
          <div className="p-4 border-b border-neutral-200 bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <MessageCircle className="text-white" size={20} />
                  {selectedContact && (
                    <div className="absolute -bottom-1 -right-1">
                      <StatusIndicator userName={selectedContact.name} size="sm" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    {selectedContact ? selectedContact.name : 'Mensajes'}
                  </h3>
                  {selectedContact && (
                    <div className="flex items-center space-x-1">
                      <p className="text-xs text-primary-100">
                        {getUserStatus(presences, selectedContact.name, teamMembers) === 'online' ? '🟢 En línea' : '🔴 Desconectado'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {selectedContact && (
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title="Volver"
                  >
                    <ChevronDown className="text-white" size={18} />
                  </button>
                )}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Minimizar"
                >
                  <Minimize2 className="text-white" size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Cerrar"
                >
                  <X className="text-white" size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {!selectedContact ? (
            // Contacts List
            <div className="flex-1 overflow-y-auto">
              {/* Search */}
              <div className="p-3 border-b border-neutral-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar contacto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Contacts */}
              <div className="divide-y divide-neutral-100">
                {filteredContacts.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageCircle className="mx-auto text-neutral-300 mb-2" size={32} />
                    <p className="text-sm text-neutral-500">No hay contactos</p>
                  </div>
                ) : (
                  filteredContacts.map(contact => {
                    const unreadCount = getUnreadCount(contact.name)
                    const lastMsg = getLastMessage(contact.name)
                    const isOnline = getUserStatus(presences, contact.name, teamMembers) === 'online'

                    return (
                      <button
                        key={contact.id}
                        onClick={() => setSelectedContact(contact)}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-neutral-50 transition-colors text-left"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-semibold">
                              {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          {/* Indicador de presencia */}
                          <div className="absolute -bottom-0.5 -right-0.5">
                            <StatusIndicator userName={contact.name} size="md" />
                          </div>
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-sm font-semibold text-neutral-900 truncate">
                              {contact.name}
                            </p>
                            {lastMsg && (
                              <span className="text-[10px] text-neutral-500">
                                {formatTime(lastMsg.timestamp)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-neutral-500 truncate flex-1">
                              {lastMsg ? lastMsg.text : 'Sin mensajes'}
                            </p>
                            {isOnline && (
                              <span className="text-[10px] text-green-600 font-medium">En línea</span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          ) : (
            // Conversation View
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
                {currentConversation.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="mx-auto text-neutral-300 mb-2" size={32} />
                    <p className="text-sm text-neutral-500">Inicia la conversación</p>
                  </div>
                ) : (
                  currentConversation.map((msg, index) => {
                    const isMine = msg.sender === currentUserName
                    return (
                      <div
                        key={index}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${isMine ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-2xl px-3 py-2 ${
                              isMine
                                ? 'bg-primary-600 text-white rounded-br-sm'
                                : 'bg-white text-neutral-900 rounded-bl-sm border border-neutral-200'
                            }`}
                          >
                            {msg.taskReference ? (
                              <div className="space-y-1">
                                <p className="text-xs opacity-90">{msg.text}</p>
                                <div className={`p-2 rounded-lg mt-2 ${
                                  isMine ? 'bg-primary-700' : 'bg-neutral-50'
                                }`}>
                                  <p className="text-xs font-semibold">{msg.taskReference.title}</p>
                                  <p className="text-[10px] opacity-75 mt-0.5">
                                    {msg.taskReference.status} • {msg.taskReference.priority}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                            )}
                          </div>
                          <p className={`text-[10px] text-neutral-500 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-200 bg-white rounded-b-2xl">
                <div className="flex items-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(true)}
                    className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors flex-shrink-0"
                    title="Compartir tarea"
                  >
                    <Paperclip size={18} />
                  </button>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none max-h-20"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500 mt-1 ml-1">
                  Presiona Enter para enviar, Shift + Enter para nueva línea
                </p>
              </form>
            </>
          )}
        </div>
      )}

      {/* Task Reference Modal */}
      {showTaskModal && (
        <TaskReferenceModal
          tasks={Object.values(tasks).flat()}
          onClose={() => setShowTaskModal(false)}
          onSelectTask={handleSelectTask}
        />
      )}
    </>
  )
}

export default ChatPanel
