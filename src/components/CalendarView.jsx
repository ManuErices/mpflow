import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react'

function CalendarView({ tasks = {}, projects, onEditTask, onAddTask }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  // Obtener todas las tareas
  const allTasks = Object.values(tasks).flat()

  // Funciones de fecha
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1))
    setSelectedDate(null)
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const getTasksForDate = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0]
    
    return allTasks.filter(task => task.dueDate === dateStr)
  }

  const getSelectedDateTasks = () => {
    if (!selectedDate) return []
    return getTasksForDate(selectedDate)
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const statusConfig = {
    'todo': { color: 'bg-neutral-500' },
    'in-progress': { color: 'bg-primary-600' },
    'review': { color: 'bg-blue-500' },
    'done': { color: 'bg-emerald-500' }
  }

  const priorityConfig = {
    high: { color: 'border-red-500', bg: 'bg-red-50' },
    medium: { color: 'border-amber-500', bg: 'bg-amber-50' },
    low: { color: 'border-emerald-500', bg: 'bg-emerald-50' }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Calendario de Tareas</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Visualiza y organiza tareas por fecha</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Hoy
            </button>
            <div className="flex items-center space-x-1 bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1.5 hover:bg-white rounded-md transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 text-sm font-semibold text-neutral-900 min-w-[140px] text-center">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="p-1.5 hover:bg-white rounded-md transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calendario */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-neutral-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-2">
              {/* Días vacíos antes del primer día */}
              {[...Array(startingDayOfWeek)].map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {/* Días del mes */}
              {[...Array(daysInMonth)].map((_, index) => {
                const day = index + 1
                const dayTasks = getTasksForDate(day)
                const isSelected = selectedDate === day
                const isTodayDate = isToday(day)

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square border-2 rounded-lg p-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : isTodayDate
                        ? 'border-primary-300 bg-primary-50/50'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-sm font-semibold mb-1 ${
                        isTodayDate ? 'text-primary-700' : 'text-neutral-900'
                      }`}>
                        {day}
                      </span>
                      <div className="flex-1 space-y-0.5 overflow-hidden">
                        {dayTasks.slice(0, 3).map((task) => {
                          const status = statusConfig[task.status]
                          return (
                            <div
                              key={task.id}
                              className={`text-[9px] px-1 py-0.5 ${status.color} text-white rounded truncate leading-tight`}
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          )
                        })}
                        {dayTasks.length > 3 && (
                          <div className="text-[8px] text-neutral-500 font-medium px-1">
                            +{dayTasks.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Panel lateral - Tareas del día seleccionado */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 lg:sticky lg:top-24">
            {!selectedDate ? (
              <div className="text-center py-12">
                <CalendarIcon size={48} className="mx-auto text-neutral-300 mb-3" />
                <h3 className="font-semibold text-neutral-900 mb-1">Selecciona un día</h3>
                <p className="text-sm text-neutral-600">Haz clic en un día para ver las tareas</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      {selectedDate} de {monthNames[month]}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {getSelectedDateTasks().length} {getSelectedDateTasks().length === 1 ? 'tarea' : 'tareas'}
                    </p>
                  </div>
                  <button
                    onClick={onAddTask}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    title="Agregar tarea"
                  >
                    <Plus size={16} className="text-primary-600" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {getSelectedDateTasks().length === 0 ? (
                    <div className="text-center py-8 text-neutral-500 text-sm">
                      No hay tareas para este día
                    </div>
                  ) : (
                    getSelectedDateTasks().map((task) => {
                      const status = statusConfig[task.status]
                      const priority = priorityConfig[task.priority]

                      return (
                        <div
                          key={task.id}
                          onClick={() => onEditTask(task)}
                          className={`p-3 border-l-2 ${priority.color} ${priority.bg} rounded-lg cursor-pointer hover:shadow-md transition-all`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm text-neutral-900 flex-1">
                              {task.title}
                            </h4>
                            <div className={`w-2 h-2 rounded-full ${status.color} flex-shrink-0 mt-1`}></div>
                          </div>
                          <p className="text-xs text-neutral-600 line-clamp-2 mb-2">
                            {task.description}
                          </p>
                          <div className="flex items-center justify-between">
                            {task.assignee && (
                              <div className="flex items-center space-x-1.5">
                                <div className="w-5 h-5 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                                  <span className="text-white text-[9px] font-semibold">
                                    {task.assignee.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <span className="text-[10px] text-neutral-600 font-medium">
                                  {task.assignee}
                                </span>
                              </div>
                            )}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex gap-1">
                                {task.tags.slice(0, 2).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[9px] px-1.5 py-0.5 bg-neutral-200 text-neutral-700 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarView
