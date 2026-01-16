import { useState, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import AuthScreen from './components/AuthScreen'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ProjectBoard from './components/ProjectBoard'
import ListView from './components/ListView'
import TeamView from './components/TeamView'
import CalendarView from './components/CalendarView'
import TopBar from './components/TopBar'
import ProjectModal from './components/ProjectModal'
import TaskModal from './components/TaskModal'
import MemberModal from './components/MemberModal'
import ConfirmModal from './components/ConfirmModal'
import NotificationPanel from './components/NotificationPanel'
import AttachmentsModal from './components/AttachmentsModal'
import ChatPanel from './components/ChatPanel'
import { ToastContainer } from './components/Toast'
import { 
  getProjects, addProject, updateProject, deleteProject,
  getTasks, addTask, updateTask, deleteTask,
  getMembers, addMember, updateMember, deleteMember,
  subscribeToProjects, subscribeToTasks, subscribeToMembers,
  sendMessage, subscribeToMessages
} from './utils/firestoreHelper'

// Función para generar ID único
const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

function App() {
  const { user } = useAuth()
  
  // Si no hay usuario, mostrar pantalla de login
  if (!user) {
    return <AuthScreen />
  }
  
  // Si hay usuario, mostrar la app
  return <MainApp user={user} />
}

function MainApp({ user }) {
  const { logout } = useAuth()
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedProject, setSelectedProject] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState({})
  const [teamMembers, setTeamMembers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [toasts, setToasts] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [selectedMemberFilter, setSelectedMemberFilter] = useState(null)
  
  // Estados para modales
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false)
  const [showChatPanel, setShowChatPanel] = useState(false)
  const [conversations, setConversations] = useState({})
  
  const [editingProject, setEditingProject] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [selectedTaskForAttachments, setSelectedTaskForAttachments] = useState(null)

  // Cargar datos desde Firestore con suscripciones en tiempo real
  useEffect(() => {
    if (!user) {
      console.log('⏳ Esperando usuario...');
      return;
    }

    console.log('👤 Usuario detectado:', user.uid);
    console.log('📧 Email:', user.email);

    let unsubProjects, unsubTasks, unsubMembers, unsubMessages

    const setupSubscriptions = async () => {
      try {
        console.log('🔄 Iniciando suscripciones a Firestore...');

        // Suscribirse a proyectos en tiempo real
        console.log('📦 Suscribiéndose a proyectos...');
        unsubProjects = subscribeToProjects(user.uid, (projectsData) => {
          console.log('✅ Proyectos recibidos:', projectsData.length, projectsData);
          setProjects(projectsData)
          if (projectsData.length > 0 && !selectedProject) {
            setSelectedProject(projectsData[0])
            console.log('🎯 Proyecto seleccionado:', projectsData[0].name);
          }
        })

        // Suscribirse a tareas en tiempo real
        console.log('📋 Suscribiéndose a tareas...');
        unsubTasks = subscribeToTasks(user.uid, (tasksData) => {
          console.log('✅ Tareas recibidas:', tasksData.length, tasksData);
          
          // Ver todos los status únicos
          const uniqueStatuses = [...new Set(tasksData.map(t => t.status))];
          console.log('📊 Status únicos encontrados:', uniqueStatuses);
          
          // Mostrar cada tarea y su status
          tasksData.forEach(task => {
            console.log('🔍 Tarea:', task.title, '→ Status:', task.status);
          });
          
          // Agrupar tareas por status
          const groupedTasks = {
            'todo': [],
            'in-progress': [],
            'review': [],
            'done': []
          }
          
          tasksData.forEach(task => {
            const status = task.status || 'todo'; // Default a 'todo' si no tiene status
            
            if (groupedTasks[status]) {
              groupedTasks[status].push(task);
            } else {
              console.warn('⚠️ Status no reconocido:', status, 'en tarea:', task.title);
              // Crear grupo dinámicamente si no existe
              groupedTasks[status] = [task];
            }
          });
          
          console.log('📊 Tareas agrupadas:', groupedTasks);
          setTasks(groupedTasks)
        })

        // Suscribirse a miembros en tiempo real
        console.log('👥 Suscribiéndose a miembros...');
        unsubMembers = subscribeToMembers(user.uid, (membersData) => {
          console.log('✅ Miembros recibidos:', membersData.length, membersData);
          setTeamMembers(membersData)
        })

        // Suscribirse a mensajes en tiempo real
        console.log('💬 Suscribiéndose a mensajes...');
        unsubMessages = subscribeToMessages(user.uid, (messagesData) => {
          console.log('✅ Mensajes recibidos:', Object.keys(messagesData).length, 'conversaciones');
          setConversations(messagesData)
        })
        
        console.log('🎉 Todas las suscripciones completadas');

      } catch (error) {
        console.error('❌ Error al configurar suscripciones:', error);
        console.error('Código de error:', error.code);
        console.error('Mensaje:', error.message);
        showToast('Error al cargar datos', 'error')
      }
    }

    setupSubscriptions()

    // Cleanup: cancelar suscripciones al desmontar
    return () => {
      console.log('🧹 Limpiando suscripciones...');
      if (unsubProjects) unsubProjects()
      if (unsubTasks) unsubTasks()
      if (unsubMembers) unsubMembers()
      if (unsubMessages) unsubMessages()
    }
  }, [user])

  // Log cuando cambian los states (para depuración)
  useEffect(() => {
    console.log('📦 State actualizado - Proyectos:', projects.length);
    console.log('📋 State actualizado - Tareas:', Object.keys(tasks).map(k => `${k}: ${tasks[k].length}`));
    console.log('👥 State actualizado - Miembros:', teamMembers.length);
  }, [projects, tasks, teamMembers]);

  // Sistema de Toast
  const showToast = (message, type = 'success', duration = 3000) => {
    const id = generateId()
    setToasts(prev => [...prev, { id, message, type, duration }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Sistema de Notificaciones
  const addNotification = (title, message, type = 'task') => {
    const notification = {
      id: generateId(),
      title,
      message,
      type,
      date: new Date().toISOString(),
      read: false
    }
    setNotifications(prev => [notification, ...prev])
  }

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Filtrar tareas por miembro seleccionado
  const getFilteredTasksByMember = (tasksObj) => {
    if (!selectedMemberFilter) return tasksObj
    
    const filtered = {}
    Object.keys(tasksObj).forEach(status => {
      filtered[status] = tasksObj[status].filter(task => 
        task.assignee === selectedMemberFilter.name
      )
    })
    return filtered
  }

  // ===== FUNCIONES CRUD PROYECTOS =====
  const handleAddProject = () => {
    setEditingProject(null)
    setShowProjectModal(true)
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setShowProjectModal(true)
  }

  const handleDeleteProject = (project) => {
    setDeletingItem({ type: 'project', data: project })
    setShowDeleteModal(true)
  }

  const handleSaveProject = async (projectData) => {
    try {
      console.log('💾 Guardando proyecto:', projectData);
      if (editingProject) {
        await updateProject(editingProject.id, projectData)
        if (selectedProject?.id === editingProject.id) {
          setSelectedProject({ ...selectedProject, ...projectData })
        }
        showToast('Área actualizado correctamente')
        addNotification('Área actualizado', `"${projectData.name}" ha sido modificado`, 'project')
      } else {
        const projectId = await addProject(projectData)
        console.log('✅ Proyecto creado con ID:', projectId);
        const newProject = { id: projectId, ...projectData }
        setSelectedProject(newProject)
        showToast('Área creado correctamente')
        addNotification('Nueva Área', `"${projectData.name}" ha sido creado`, 'project')
      }
    } catch (error) {
      console.error('❌ Error al guardar proyecto:', error)
      showToast('Error al guardar Área', 'error')
    }
  }

  const confirmDeleteProject = async () => {
    if (!deletingItem || deletingItem.type !== 'project') return

    const project = deletingItem.data
    
    try {
      // Eliminar proyecto
      await deleteProject(project.id)
      
      // Eliminar todas las tareas del proyecto
      const projectTasks = Object.values(tasks).flat().filter(t => t.projectId === project.id)
      for (const task of projectTasks) {
        await deleteTask(task.id)
      }

      if (selectedProject?.id === project.id) {
        const remainingProjects = projects.filter(p => p.id !== project.id)
        setSelectedProject(remainingProjects.length > 0 ? remainingProjects[0] : null)
      }

      showToast('Área eliminado correctamente')
      addNotification('Área eliminada', `"${project.name}" ha sido eliminado`, 'project')
    } catch (error) {
      console.error('Error al eliminar proyecto:', error)
      showToast('Error al eliminar Área', 'error')
    }
    
    setDeletingItem(null)
  }

  // ===== FUNCIONES CRUD TAREAS =====
  const handleAddTask = () => {
    if (!selectedProject) {
      showToast('Selecciona un Área primero', 'error')
      return
    }
    setEditingTask(null)
    setShowTaskModal(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const handleDeleteTask = (task) => {
    setDeletingItem({ type: 'task', data: task })
    setShowDeleteModal(true)
  }

  const handleSaveTask = async (taskData) => {
    try {
      console.log('💾 Guardando tarea:', taskData);
      if (editingTask) {
        await updateTask(editingTask.id, taskData)
        showToast('Tarea actualizada correctamente')
        addNotification('Tarea actualizada', `"${taskData.title}" ha sido modificada`, 'task')
      } else {
        const taskId = await addTask({
          ...taskData,
          projectId: selectedProject.id
        })
        console.log('✅ Tarea creada con ID:', taskId);
        showToast('Tarea creada correctamente')
        addNotification('Nueva tarea', `"${taskData.title}" ha sido creada`, 'task')
        
        if (taskData.assignee) {
          addNotification('Tarea asignada', `"${taskData.title}" fue asignada a ${taskData.assignee}`, 'assignment')
        }
      }
    } catch (error) {
      console.error('❌ Error al guardar tarea:', error)
      showToast('Error al guardar tarea', 'error')
    }
  }

  const confirmDeleteTask = async () => {
    if (!deletingItem || deletingItem.type !== 'task') return

    const task = deletingItem.data
    
    try {
      await deleteTask(task.id)
      showToast('Tarea eliminada correctamente')
      addNotification('Tarea eliminada', `"${task.title}" ha sido eliminada`, 'task')
    } catch (error) {
      console.error('Error al eliminar tarea:', error)
      showToast('Error al eliminar tarea', 'error')
    }
    
    setDeletingItem(null)
  }

  const moveTask = async (taskId, fromStatus, toStatus) => {
    try {
      console.log('🔄 Moviendo tarea:', taskId, 'de', fromStatus, 'a', toStatus);
      await updateTask(taskId, { status: toStatus })
      showToast(`Tarea movida a ${toStatus}`)
    } catch (error) {
      console.error('Error al mover tarea:', error)
      showToast('Error al mover tarea', 'error')
    }
  }

  const handleOpenAttachments = (task) => {
    setSelectedTaskForAttachments(task)
    setShowAttachmentsModal(true)
  }

  const handleSaveAttachments = async (taskId, attachments) => {
    try {
      await updateTask(taskId, { attachments })
      showToast('Archivos actualizados correctamente')
    } catch (error) {
      console.error('Error al guardar archivos:', error)
      showToast('Error al guardar archivos', 'error')
    }
  }

  // ===== FUNCIONES CRUD MIEMBROS =====
  const handleAddMember = () => {
    setEditingMember(null)
    setShowMemberModal(true)
  }

  const handleEditMember = (member) => {
    setEditingMember(member)
    setShowMemberModal(true)
  }

  const handleDeleteMember = (member) => {
    setDeletingItem({ type: 'member', data: member })
    setShowDeleteModal(true)
  }

  const handleSaveMember = async (memberData) => {
    try {
      console.log('💾 Guardando miembro:', memberData);
      if (editingMember) {
        await updateMember(editingMember.id, memberData)
        showToast('Miembro actualizado correctamente')
      } else {
        const memberId = await addMember(memberData)
        console.log('✅ Miembro creado con ID:', memberId);
        showToast('Miembro agregado correctamente')
        addNotification('Nuevo miembro', `${memberData.name} se unió al equipo`, 'assignment')
      }
    } catch (error) {
      console.error('❌ Error al guardar miembro:', error)
      showToast('Error al guardar miembro', 'error')
    }
  }

  const confirmDeleteMember = async () => {
    if (!deletingItem || deletingItem.type !== 'member') return

    const member = deletingItem.data
    
    try {
      await deleteMember(member.id)
      showToast('Miembro eliminado correctamente')
      addNotification('Miembro removido', `${member.name} fue removido del equipo`, 'assignment')
    } catch (error) {
      console.error('Error al eliminar miembro:', error)
      showToast('Error al eliminar miembro', 'error')
    }
    
    setDeletingItem(null)
  }

  const confirmDelete = () => {
    if (deletingItem?.type === 'project') {
      confirmDeleteProject()
    } else if (deletingItem?.type === 'task') {
      confirmDeleteTask()
    } else if (deletingItem?.type === 'member') {
      confirmDeleteMember()
    }
  }

  const getDeleteMessage = () => {
    if (!deletingItem || !deletingItem.data) return ''
    
    if (deletingItem.type === 'project') {
      const project = deletingItem.data
      const taskCount = Object.values(tasks).flat().filter(t => t.projectId === project.id).length
      return `¿Estás seguro de que deseas eliminar "${project.name}"? ${taskCount > 0 ? `Se eliminarán también ${taskCount} tareas asociadas.` : ''} Esta acción no se puede deshacer.`
    } else if (deletingItem.type === 'task') {
      const task = deletingItem.data
      return `¿Estás seguro de que deseas eliminar la tarea "${task.title || 'Sin título'}"? Esta acción no se puede deshacer.`
    } else if (deletingItem.type === 'member') {
      const member = deletingItem.data
      return `¿Estás seguro de que deseas eliminar a "${member.name || 'Sin nombre'}" del equipo? Esta acción no se puede deshacer.`
    }
    return ''
  }

const currentUserName = user?.displayName || user?.email || ''

  // ===== FUNCIONES CHAT =====
  const handleSendMessage = async (receiverName, message) => {
    try {
      // Buscar el receiverId del miembro
      const receiver = teamMembers.find(m => m.name === receiverName)
      if (!receiver) {
        console.error('❌ No se encontró el receptor:', receiverName)
        return
      }

      // Agregar IDs necesarios para Firestore
      const messageWithIds = {
        ...message,
        receiverId: receiver.id, // Usar el ID del miembro
        senderName: currentUserName,
        receiverName: receiverName
      }

      // Guardar en Firestore
      await sendMessage(messageWithIds, user.uid)
      
      // El estado se actualizará automáticamente por la suscripción
      console.log('✅ Mensaje enviado correctamente')
      
    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error)
      showToast('Error al enviar mensaje', 'error')
    }
  }

  // Contar mensajes no leídos
  const getUnreadMessagesCount = () => {
    const currentUserName = user?.displayName || user?.email || ''
    let count = 0
    
    Object.values(conversations).forEach(conv => {
      count += conv.filter(msg => 
        !msg.read && msg.receiver === currentUserName
      ).length
    })
    
    return count
  }

  const unreadMessagesCount = getUnreadMessagesCount()

  // Filtrar tareas por proyecto
  const getFilteredTasks = () => {
    if (!selectedProject) return tasks

    const filtered = {}
    Object.keys(tasks).forEach(status => {
      filtered[status] = tasks[status].filter(task => task.projectId === selectedProject.id)
    })
    return filtered
  }

  const unreadNotificationCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onAddProject={handleAddProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        currentView={currentView}
        onViewChange={setCurrentView}
        user={user}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col">
        <TopBar 
          currentView={currentView}
          onViewChange={setCurrentView}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onAddTask={handleAddTask}
          notificationCount={unreadNotificationCount}
          onNotificationClick={() => setShowNotificationPanel(!showNotificationPanel)}
          unreadMessagesCount={unreadMessagesCount}
          onMessagesClick={() => setShowChatPanel(!showChatPanel)}
          teamMembers={teamMembers}
          selectedMember={selectedMemberFilter}
          onMemberFilter={setSelectedMemberFilter}
        />

        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          {currentView === 'dashboard' && (
            <Dashboard
              projects={projects}
              tasks={tasks}
              teamMembers={teamMembers}
            />
          )}
          
          {currentView === 'board' && (
            <ProjectBoard 
              projects={projects}
              selectedProject={selectedProject}
              tasks={getFilteredTasksByMember(getFilteredTasks())}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onMoveTask={moveTask}
              onOpenAttachments={handleOpenAttachments}
            />
          )}
          
          {currentView === 'list' && (
            <ListView
              tasks={getFilteredTasksByMember(getFilteredTasks())}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onMoveTask={moveTask}
              onOpenAttachments={handleOpenAttachments}
            />
          )}

          {currentView === 'team' && (
            <TeamView
              tasks={getFilteredTasks()}
              projects={projects}
              onEditTask={handleEditTask}
              teamMembers={teamMembers}
              onAddMember={handleAddMember}
              onEditMember={handleEditMember}
              onDeleteMember={handleDeleteMember}
            />
          )}
          
          {currentView === 'calendar' && (
            <CalendarView
              tasks={getFilteredTasks()}
              projects={projects}
              onEditTask={handleEditTask}
              onAddTask={handleAddTask}
            />
          )}
        </main>
      </div>

      {/* Modales */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false)
          setEditingProject(null)
        }}
        onSave={handleSaveProject}
        project={editingProject}
      />

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
        task={editingTask}
        projects={projects}
        currentProject={selectedProject}
        teamMembers={teamMembers}
      />

      <MemberModal
        isOpen={showMemberModal}
        onClose={() => {
          setShowMemberModal(false)
          setEditingMember(null)
        }}
        onSave={handleSaveMember}
        member={editingMember}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingItem(null)
        }}
        onConfirm={confirmDelete}
        title={
          deletingItem?.type === 'project' ? '¿Eliminar Área?' :
          deletingItem?.type === 'task' ? '¿Eliminar tarea?' :
          '¿Eliminar miembro?'
        }
        message={getDeleteMessage()}
        confirmText="Eliminar"
        type="danger"
      />

      <AttachmentsModal
        isOpen={showAttachmentsModal}
        onClose={() => {
          setShowAttachmentsModal(false)
          setSelectedTaskForAttachments(null)
        }}
        task={selectedTaskForAttachments}
        onSave={handleSaveAttachments}
      />

      <NotificationPanel
        isOpen={showNotificationPanel}
        onClose={() => setShowNotificationPanel(false)}
        notifications={notifications}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
        onDelete={deleteNotification}
      />
      <ChatPanel
        isOpen={showChatPanel}
        onClose={() => setShowChatPanel(false)}
        teamMembers={teamMembers}
        tasks={tasks}
        onSendMessage={handleSendMessage}
        conversations={conversations}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default App
