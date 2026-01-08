import { X, Paperclip, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import FileAttachments from './FileAttachments'
import { uploadMultipleFiles, deleteFile } from '../utils/storageHelper'

function AttachmentsModal({ isOpen, onClose, task, onSave }) {
  const { user } = useAuth()
  const [attachments, setAttachments] = useState(task?.attachments || [])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const currentUserName = user?.displayName || user?.email || ''
  const canModify = task?.assignee === currentUserName || task?.requestedBy === currentUserName

  const handleUploadFiles = async (files) => {
    if (!canModify) {
      alert('Solo el asignado o solicitante puede adjuntar archivos')
      return
    }

    setUploading(true)
    setUploadError(null)
    
    console.log('Iniciando subida de archivos:', files.length)
    
    try {
      const uploadedFiles = await uploadMultipleFiles(files, user.uid)
      console.log('Archivos subidos exitosamente:', uploadedFiles)
      
      const newAttachments = [...attachments, ...uploadedFiles]
      setAttachments(newAttachments)
      
      // Auto-guardar
      await onSave(task.id, newAttachments)
    } catch (error) {
      console.error('Error al subir archivos:', error)
      setUploadError(error.message || 'Error al subir archivos')
      alert(`Error al subir archivos: ${error.message}`)
    } finally {
      setUploading(false)
      console.log('Proceso de subida finalizado')
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
      const newAttachments = attachments.filter(f => f.id !== fileId)
      setAttachments(newAttachments)
      
      // Auto-guardar
      await onSave(task.id, newAttachments)
    } catch (error) {
      console.error('Error al eliminar archivo:', error)
      alert('Error al eliminar archivo')
    }
  }

  const handleClose = () => {
    if (uploading) {
      if (!confirm('Hay archivos subiendo. ¿Seguro que quieres cerrar?')) {
        return
      }
    }
    setUploadError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-large w-full max-w-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 flex items-center space-x-2">
              <Paperclip size={20} />
              <span>Archivos Adjuntos</span>
            </h2>
            <p className="text-sm text-neutral-600 mt-1">{task?.title}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Mensaje de permisos */}
          {!canModify && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                Solo puedes ver los archivos. Para adjuntar o eliminar, debes ser el asignado o solicitante.
              </p>
            </div>
          )}

          {/* Error de subida */}
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">Error:</p>
              <p className="text-sm text-red-700 mt-1">{uploadError}</p>
            </div>
          )}

          {/* Indicador de carga */}
          {uploading && (
            <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Loader2 size={20} className="text-primary-600 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-primary-900">Subiendo archivos...</p>
                  <p className="text-xs text-primary-700 mt-1">Por favor espera, no cierres esta ventana</p>
                </div>
              </div>
            </div>
          )}

          {/* Componente de archivos */}
          <FileAttachments
            attachments={attachments}
            onUpload={canModify ? handleUploadFiles : null}
            onDelete={canModify ? handleDeleteFile : null}
            maxSize={10}
            disabled={uploading}
          />

          {attachments.length === 0 && !uploading && (
            <div className="text-center py-8 text-neutral-500">
              <Paperclip size={48} className="mx-auto mb-2 text-neutral-300" />
              <p className="text-sm">No hay archivos adjuntos en esta tarea</p>
              {canModify && (
                <p className="text-xs text-neutral-400 mt-2">Arrastra archivos aquí o haz click para seleccionar</p>
              )}
            </div>
          )}

          {/* Resumen */}
          {attachments.length > 0 && (
            <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
              <p className="text-xs text-neutral-600">
                {attachments.length} archivo{attachments.length !== 1 ? 's' : ''} adjunto{attachments.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-5 border-t border-neutral-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default AttachmentsModal
