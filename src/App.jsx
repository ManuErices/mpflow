import { useState, useEffect } from 'react'
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

// Función para generar ID único
const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

function App() {
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

  // Cargar datos desde localStorage al iniciar
  useEffect(() => {
    const savedProjects = localStorage.getItem('mpflow_projects')
    const savedTasks = localStorage.getItem('mpflow_tasks')
    const savedMembers = localStorage.getItem('mpflow_members')
    const savedNotifications = localStorage.getItem('mpflow_notifications')
    
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects)
        setProjects(parsedProjects)
        if (parsedProjects.length > 0 && !selectedProject) {
          setSelectedProject(parsedProjects[0])
        }
      } catch (error) {
        console.error('Error al cargar proyectos:', error)
        initializeDefaultData()
      }
    } else {
      initializeDefaultData()
    }

    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (error) {
        console.error('Error al cargar tareas:', error)
      }
    }

    if (savedMembers) {
      try {
        setTeamMembers(JSON.parse(savedMembers))
      } catch (error) {
        console.error('Error al cargar miembros:', error)
      }
    }

    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (error) {
        console.error('Error al cargar notificaciones:', error)
      }
    }
  }, [])

  // Guardar en localStorage
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('mpflow_projects', JSON.stringify(projects))
    }
  }, [projects])

  useEffect(() => {
    if (Object.keys(tasks).length > 0) {
      localStorage.setItem('mpflow_tasks', JSON.stringify(tasks))
    }
  }, [tasks])

  useEffect(() => {
    if (teamMembers.length > 0) {
      localStorage.setItem('mpflow_members', JSON.stringify(teamMembers))
    }
  }, [teamMembers])

  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('mpflow_notifications', JSON.stringify(notifications))
    }
  }, [notifications])

  const initializeDefaultData = () => {
    const defaultProjects = [
      {
        id: generateId(),
        name: 'Edificio Residencial Centro',
        status: 'En Progreso',
        color: '#9333ea',
        description: 'Construcción de edificio residencial de 8 pisos'
      },
      {
        id: generateId(),
        name: 'Remodelación Oficinas',
        status: 'En Progreso',
        color: '#3b82f6',
        description: 'Remodelación integral de oficinas corporativas'
      }
    ]
    setProjects(defaultProjects)
    setSelectedProject(defaultProjects[0])

    const exampleTasks = {
      'todo': [
        {
          id: generateId(),
          title: 'Preparación del terreno',
          description: 'Limpieza y nivelación del área de construcción',
          priority: 'high',
          assignee: 'Carlos M.',
          dueDate: '2026-01-15',
          tags: ['Fundación', 'Urgente'],
          projectId: defaultProjects[0].id,
          status: 'todo',
          checklist: { completed: 2, total: 5, items: [
            { text: 'Marcar límites', completed: true },
            { text: 'Limpiar maleza', completed: true },
            { text: 'Nivelar terreno', completed: false },
            { text: 'Compactar suelo', completed: false },
            { text: 'Verificar pendientes', completed: false }
          ]}
        }
      ],
      'in-progress': [],
      'review': [],
      'done': []
    }
    setTasks(exampleTasks)

    // Notificaciones de ejemplo
    addNotification('Bienvenido a MPFlow', 'Sistema de gestión profesional para MPF Ingeniería Civil', 'project')
  }

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

  const handleSaveProject = (projectData) => {
    if (editingProject) {
      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === editingProject.id ? { ...p, ...projectData } : p
        )
      )
      if (selectedProject?.id === editingProject.id) {
        setSelectedProject({ ...selectedProject, ...projectData })
      }
      showToast('Proyecto actualizado correctamente')
      addNotification('Proyecto actualizado', `"${projectData.name}" ha sido modificado`, 'project')
    } else {
      const newProject = {
        id: generateId(),
        ...projectData,
      }
      setProjects(prevProjects => [...prevProjects, newProject])
      setSelectedProject(newProject)
      showToast('Proyecto creado correctamente')
      addNotification('Nuevo proyecto', `"${projectData.name}" ha sido creado`, 'project')
    }
  }

  const confirmDeleteProject = () => {
    if (!deletingItem || deletingItem.type !== 'project') return

    const project = deletingItem.data
    setProjects(prevProjects => prevProjects.filter(p => p.id !== project.id))

    const newTasks = {}
    Object.keys(tasks).forEach(status => {
      newTasks[status] = tasks[status].filter(t => t.projectId !== project.id)
    })
    setTasks(newTasks)

    if (selectedProject?.id === project.id) {
      const remainingProjects = projects.filter(p => p.id !== project.id)
      setSelectedProject(remainingProjects.length > 0 ? remainingProjects[0] : null)
    }

    showToast('Proyecto eliminado correctamente')
    addNotification('Proyecto eliminado', `"${project.name}" ha sido eliminado`, 'project')
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

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      const newTasks = { ...tasks }
      Object.keys(newTasks).forEach(status => {
        newTasks[status] = newTasks[status].map(t =>
          t.id === editingTask.id ? { ...t, ...taskData } : t
        )
      })
      
      if (taskData.status !== editingTask.status) {
        newTasks[editingTask.status] = newTasks[editingTask.status].filter(t => t.id !== editingTask.id)
        newTasks[taskData.status] = [...(newTasks[taskData.status] || []), { ...editingTask, ...taskData }]
      }
      
      setTasks(newTasks)
      updateProjectStats()
      showToast('Tarea actualizada correctamente')
      addNotification('Tarea actualizada', `"${taskData.title}" ha sido modificada`, 'task')
    } else {
      const newTask = {
        id: generateId(),
        ...taskData,
      }
      
      setTasks(prev => ({
        ...prev,
        [taskData.status]: [...(prev[taskData.status] || []), newTask]
      }))
      updateProjectStats()
      showToast('Tarea creada correctamente')
      addNotification('Nueva tarea', `"${taskData.title}" ha sido creada`, 'task')
      
      if (taskData.assignee) {
        addNotification('Tarea asignada', `Se te asignó "${taskData.title}"`, 'assignment')
      }
    }
  }

  const confirmDeleteTask = () => {
    if (!deletingItem || deletingItem.type !== 'task') return

    const task = deletingItem.data
    const newTasks = { ...tasks }
    Object.keys(newTasks).forEach(status => {
      newTasks[status] = newTasks[status].filter(t => t.id !== task.id)
    })
    setTasks(newTasks)
    updateProjectStats()
    showToast('Tarea eliminada correctamente')
    addNotification('Tarea eliminada', `"${task.title}" ha sido eliminada`, 'task')
    setDeletingItem(null)
  }

  const moveTask = (taskId, fromStatus, toStatus) => {
    const task = tasks[fromStatus]?.find(t => t.id === taskId)
    if (!task) return

    setTasks(prev => ({
      ...prev,
      [fromStatus]: prev[fromStatus].filter(t => t.id !== taskId),
      [toStatus]: [...(prev[toStatus] || []), { ...task, status: toStatus }]
    }))
    updateProjectStats()
    showToast(`Tarea movida a ${toStatus === 'done' ? 'Completado' : toStatus}`)
    
    if (toStatus === 'done') {
      addNotification('Tarea completada', `"${task.title}" ha sido completada`, 'task')
    }
  }

  const updateProjectStats = () => {
    const updatedProjects = projects.map(project => {
      const projectTasks = Object.values(tasks).flat().filter(t => t.projectId === project.id)
      const completedTasks = projectTasks.filter(t => t.status === 'done').length
      
      return {
        ...project,
        tasks: projectTasks.length,
        completedTasks,
        progress: projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0
      }
    })
    setProjects(updatedProjects)
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

  const handleSaveMember = (memberData) => {
    if (editingMember) {
      setTeamMembers(prev => prev.map(m =>
        m.id === editingMember.id ? { ...m, ...memberData } : m
      ))
      showToast('Miembro actualizado correctamente')
    } else {
      const newMember = {
        id: generateId(),
        ...memberData
      }
      setTeamMembers(prev => [...prev, newMember])
      showToast('Miembro agregado correctamente')
      addNotification('Nuevo miembro', `${memberData.name} se unió al equipo`, 'assignment')
    }
  }

  const confirmDeleteMember = () => {
    if (!deletingItem || deletingItem.type !== 'member') return

    const member = deletingItem.data
    setTeamMembers(prev => prev.filter(m => m.id !== member.id))
    showToast('Miembro eliminado correctamente')
    addNotification('Miembro removido', `${member.name} fue removido del equipo`, 'assignment')
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
