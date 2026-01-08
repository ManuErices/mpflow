import { X, Paperclip } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import FileAttachments from './FileAttachments'
import { uploadMultipleFiles, deleteFile } from '../utils/storageHelper'

function AttachmentsModal({ isOpen, onClose, task, onSave }) {
  const { user } = useAuth()
  const [attachments, setAttachments] = useState(task?.attachments || [])
  const [uploading, setUploading] = useState(false)

  const currentUserName = user?.displayName || user?.email || ''
  const canModify = task?.assignee === currentUserName || task?.requestedBy === currentUserName

  const handleUploadFiles = async (files) => {
    if (!canModify) {
      alert('Solo el asignado o solicitante puede adjuntar archivos')
      return
    }

    setUploading(true)
    try {
      const uploadedFiles = await uploadMultipleFiles(files, user.uid)
      const newAttachments = [...attachments, ...uploadedFiles]
      setAttachments(newAttachments)
    } catch (error) {
      console.error('Error al subir archivos:', error)
      alert('Error al subir archivos')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId) => {
    if (!canModify) {
      alert('Solo el asignado o solicitante puede eliminar archivos')
      return
    }

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

  const handleSave = () => {
    onSave(task.id, attachments)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-large w-full max-w-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Archivos Adjuntos</h2>
            <p className="text-sm text-neutral-600 mt-1">{task?.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {!canModify && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                Solo puedes ver los archivos. Para adjuntar o eliminar archivos, debes ser el asignado o solicitante de esta tarea.
              </p>
            </div>
          )}

          <FileAttachments
            attachments={attachments}
            onUpload={canModify ? handleUploadFiles : null}
            onDelete={canModify ? handleDeleteFile : null}
            maxSize={10}
          />

          {attachments.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              <Paperclip size={48} className="mx-auto mb-2 text-neutral-300" />
              <p className="text-sm">No hay archivos adjuntos en esta tarea</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-5 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors font-medium"
          >
            {canModify ? 'Cancelar' : 'Cerrar'}
          </button>
          {canModify && (
            <button
              onClick={handleSave}
              disabled={uploading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm disabled:opacity-50"
            >
              {uploading ? 'Subiendo...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttachmentsModal
