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
import { ToastContainer } from './components/Toast'
import { 
  getProjects, addProject, updateProject, deleteProject,
  getTasks, addTask, updateTask, deleteTask,
  getMembers, addMember, updateMember, deleteMember,
  subscribeToProjects, subscribeToTasks, subscribeToMembers
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
  const [searchQuery, setSearchQuery] = useState('')
  
  // Estados para modales
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  
  const [editingProject, setEditingProject] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)

  // Cargar datos desde Firestore con suscripciones en tiempo real
  useEffect(() => {
    if (!user) return

    let unsubProjects, unsubTasks, unsubMembers

    const setupSubscriptions = async () => {
      try {
        // Suscribirse a proyectos en tiempo real
        unsubProjects = subscribeToProjects(user.uid, (projectsData) => {
          setProjects(projectsData)
          if (projectsData.length > 0 && !selectedProject) {
            setSelectedProject(projectsData[0])
          }
        })

        // Suscribirse a tareas en tiempo real
        unsubTasks = subscribeToTasks(user.uid, (tasksData) => {
          const groupedTasks = {
            'todo': [],
            'in-progress': [],
            'review': [],
            'done': []
          }
          tasksData.forEach(task => {
            if (groupedTasks[task.status]) {
              groupedTasks[task.status].push(task)
            }
          })
          setTasks(groupedTasks)
        })

        // Suscribirse a miembros en tiempo real
        unsubMembers = subscribeToMembers(user.uid, (membersData) => {
          setTeamMembers(membersData)
        })

      } catch (error) {
        console.error('Error al configurar suscripciones:', error)
        showToast('Error al cargar datos', 'error')
      }
    }

    setupSubscriptions()

    // Cleanup: cancelar suscripciones al desmontar
    return () => {
      if (unsubProjects) unsubProjects()
      if (unsubTasks) unsubTasks()
      if (unsubMembers) unsubMembers()
    }
  }, [user])

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
      if (editingProject) {
        await updateProject(editingProject.id, projectData)
        if (selectedProject?.id === editingProject.id) {
          setSelectedProject({ ...selectedProject, ...projectData })
        }
        showToast('Proyecto actualizado correctamente')
        addNotification('Proyecto actualizado', `"${projectData.name}" ha sido modificado`, 'project')
      } else {
        const projectId = await addProject(user.uid, projectData)
        const newProject = { id: projectId, ...projectData }
        setSelectedProject(newProject)
        showToast('Proyecto creado correctamente')
        addNotification('Nuevo proyecto', `"${projectData.name}" ha sido creado`, 'project')
      }
    } catch (error) {
      console.error('Error al guardar proyecto:', error)
      showToast('Error al guardar proyecto', 'error')
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

      showToast('Proyecto eliminado correctamente')
      addNotification('Proyecto eliminado', `"${project.name}" ha sido eliminado`, 'project')
    } catch (error) {
      console.error('Error al eliminar proyecto:', error)
      showToast('Error al eliminar proyecto', 'error')
    }
    
    setDeletingItem(null)
  }

  // ===== FUNCIONES CRUD TAREAS =====
  const handleAddTask = () => {
    if (!selectedProject) {
      showToast('Selecciona un proyecto primero', 'error')
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
      if (editingTask) {
        await updateTask(editingTask.id, taskData)
        showToast('Tarea actualizada correctamente')
        addNotification('Tarea actualizada', `"${taskData.title}" ha sido modificada`, 'task')
      } else {
        await addTask(user.uid, taskData)
        showToast('Tarea creada correctamente')
        addNotification('Nueva tarea', `"${taskData.title}" ha sido creada`, 'task')
        
        if (taskData.assignee) {
          addNotification('Tarea asignada', `Se te asignó "${taskData.title}"`, 'assignment')
        }
      }
    } catch (error) {
      console.error('Error al guardar tarea:', error)
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
    const task = tasks[fromStatus]?.find(t => t.id === taskId)
    if (!task) return

    try {
      await updateTask(taskId, { status: toStatus })
      showToast(`Tarea movida a ${toStatus === 'done' ? 'Completado' : toStatus}`)
      
      if (toStatus === 'done') {
        addNotification('Tarea completada', `"${task.title}" ha sido completada`, 'task')
      }
    } catch (error) {
      console.error('Error al mover tarea:', error)
      showToast('Error al mover tarea', 'error')
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
      if (editingMember) {
        await updateMember(editingMember.id, memberData)
        showToast('Miembro actualizado correctamente')
      } else {
        await addMember(user.uid, memberData)
        showToast('Miembro agregado correctamente')
        addNotification('Nuevo miembro', `${memberData.name} se unió al equipo`, 'assignment')
      }
    } catch (error) {
      console.error('Error al guardar miembro:', error)
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
    if (!deletingItem) return ''
    
    if (deletingItem.type === 'project') {
      const taskCount = Object.values(tasks).flat().filter(t => t.projectId === deletingItem.data.id).length
      return `¿Estás seguro de que deseas eliminar "${deletingItem.data.name}"? ${taskCount > 0 ? `Se eliminarán también ${taskCount} tareas asociadas.` : ''} Esta acción no se puede deshacer.`
    } else if (deletingItem.type === 'task') {
      return `¿Estás seguro de que deseas eliminar la tarea "${deletingItem.data.title}"? Esta acción no se puede deshacer.`
    } else if (deletingItem.type === 'member') {
      return `¿Estás seguro de que deseas eliminar a "${deletingItem.data.name}" del equipo? Esta acción no se puede deshacer.`
    }
    return ''
  }

  // Filtrar tareas
  const getFilteredTasks = () => {
    if (!selectedProject) return tasks

    const filtered = {}
    Object.keys(tasks).forEach(status => {
      filtered[status] = tasks[status].filter(task => task.projectId === selectedProject.id)
    })
    return filtered
  }

  const getSearchedTasks = () => {
    const filteredByProject = getFilteredTasks()
    
    if (!searchQuery.trim()) return filteredByProject

    const query = searchQuery.toLowerCase()
    const searched = {}
    
    Object.keys(filteredByProject).forEach(status => {
      searched[status] = filteredByProject[status].filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.assignee?.toLowerCase().includes(query) ||
        task.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    })
    
    return searched
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
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notificationCount={unreadNotificationCount}
          onNotificationClick={() => setShowNotificationPanel(!showNotificationPanel)}
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
              tasks={getSearchedTasks()}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onMoveTask={moveTask}
            />
          )}
          
          {currentView === 'list' && (
            <ListView
              tasks={getSearchedTasks()}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onMoveTask={moveTask}
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
          deletingItem?.type === 'project' ? '¿Eliminar proyecto?' :
          deletingItem?.type === 'task' ? '¿Eliminar tarea?' :
          '¿Eliminar miembro?'
        }
        message={getDeleteMessage()}
        confirmText="Eliminar"
        type="danger"
      />

      <NotificationPanel
        isOpen={showNotificationPanel}
        onClose={() => setShowNotificationPanel(false)}
        notifications={notifications}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
        onDelete={deleteNotification}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default App
