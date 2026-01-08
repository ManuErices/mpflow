import { Download, FileText, Table } from 'lucide-react'
import { useState } from 'react'

function ExportMenu({ projects, tasks, teamMembers }) {
  const [isOpen, setIsOpen] = useState(false)

  const exportToCSV = () => {
    const allTasks = Object.values(tasks).flat()
    
    const headers = ['ID', 'Título', 'Descripción', 'Estado', 'Prioridad', 'Asignado', 'Fecha Vencimiento', 'Proyecto', 'Tags', 'Progreso']
    const rows = allTasks.map(task => {
      const project = projects.find(p => p.id === task.projectId)
      const progress = task.checklist ? `${task.checklist.completed}/${task.checklist.total}` : '0/0'
      
      return [
        task.id,
        task.title,
        task.description || '',
        task.status,
        task.priority,
        task.assignee || '',
        task.dueDate || '',
        project?.name || '',
        task.tags?.join('; ') || '',
        progress
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `mpflow_tareas_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    setIsOpen(false)
  }

  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      projects,
      tasks,
      teamMembers,
      summary: {
        totalProjects: projects.length,
        totalTasks: Object.values(tasks).flat().length,
        totalMembers: teamMembers.length
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `mpflow_backup_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    setIsOpen(false)
  }

  const exportProjectReport = () => {
    const allTasks = Object.values(tasks).flat()
    
    let report = 'REPORTE DE PROYECTOS - MPFLOW\n'
    report += 'MPF Ingeniería Civil\n'
    report += `Fecha: ${new Date().toLocaleDateString('es-ES')}\n`
    report += '='.repeat(60) + '\n\n'

    projects.forEach(project => {
      const projectTasks = allTasks.filter(t => t.projectId === project.id)
      const completedTasks = projectTasks.filter(t => t.status === 'done').length
      const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0

      report += `PROYECTO: ${project.name}\n`
      report += `-`.repeat(60) + '\n'
      report += `Estado: ${project.status}\n`
      report += `Descripción: ${project.description || 'N/A'}\n`
      report += `Total de tareas: ${projectTasks.length}\n`
      report += `Tareas completadas: ${completedTasks}\n`
      report += `Progreso: ${progress}%\n\n`

      if (projectTasks.length > 0) {
        report += 'Tareas:\n'
        projectTasks.forEach(task => {
          report += `  • ${task.title} [${task.status}] - ${task.assignee || 'Sin asignar'}\n`
        })
        report += '\n'
      }

      report += '\n'
    })

    const blob = new Blob([report], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `mpflow_reporte_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium"
      >
        <Download size={16} />
        <span>Exportar</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
            <div className="px-3 py-2 border-b border-neutral-200">
              <p className="text-xs font-semibold text-neutral-600 uppercase">Exportar Datos</p>
            </div>

            <button
              onClick={exportToCSV}
              className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-neutral-50 transition-colors"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Table size={16} className="text-emerald-600" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-neutral-900">Exportar a CSV</div>
                <div className="text-xs text-neutral-500">Todas las tareas en formato tabla</div>
              </div>
            </button>

            <button
              onClick={exportToJSON}
              className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-neutral-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-neutral-900">Backup Completo</div>
                <div className="text-xs text-neutral-500">Respaldo de todos los datos (JSON)</div>
              </div>
            </button>

            <button
              onClick={exportProjectReport}
              className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-neutral-50 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-primary-600" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-neutral-900">Reporte de Proyectos</div>
                <div className="text-xs text-neutral-500">Resumen detallado en texto</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ExportMenu
