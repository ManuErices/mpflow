import { useState } from 'react'
import { Upload, File, Image, FileText, Download, Trash2, X, Loader } from 'lucide-react'

function FileAttachments({ attachments = [], onUpload, onDelete, maxSize = 10 }) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = async (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      await handleFiles(e.target.files)
    }
  }

  const handleFiles = async (files) => {
    const validFiles = []
    
    for (let file of files) {
      // Validar tamaño (max 10MB por defecto)
      if (file.size > maxSize * 1024 * 1024) {
        alert(`El archivo ${file.name} excede el tamaño máximo de ${maxSize}MB`)
        continue
      }

      // Validar tipo
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ]

      if (!validTypes.includes(file.type)) {
        alert(`El tipo de archivo ${file.name} no es válido`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length > 0) {
      setUploading(true)
      try {
        await onUpload(validFiles)
      } catch (error) {
        console.error('Error al subir archivos:', error)
      } finally {
        setUploading(false)
      }
    }
  }

  const getFileIcon = (type) => {
    if (type.includes('image')) return <Image size={20} className="text-blue-500" />
    if (type.includes('pdf')) return <FileText size={20} className="text-red-500" />
    if (type.includes('word')) return <File size={20} className="text-blue-600" />
    if (type.includes('excel') || type.includes('spreadsheet')) return <File size={20} className="text-green-600" />
    return <File size={20} className="text-neutral-500" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-neutral-300 hover:border-primary-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          className="hidden"
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center space-y-2">
            {uploading ? (
              <Loader className="animate-spin text-primary-600" size={32} />
            ) : (
              <Upload className="text-neutral-400" size={32} />
            )}
            <div className="text-sm text-neutral-600">
              <span className="font-medium text-primary-600 hover:text-primary-700">
                Click para subir
              </span>{' '}
              o arrastra archivos aquí
            </div>
            <p className="text-xs text-neutral-500">
              PDF, Word, Excel, imágenes (máx {maxSize}MB)
            </p>
          </div>
        </label>
      </div>

      {/* Lista de archivos */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-700">
            Archivos adjuntos ({attachments.length})
          </p>
          <div className="space-y-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-neutral-200 rounded transition-colors"
                    title="Descargar"
                  >
                    <Download size={16} className="text-neutral-600" />
                  </a>
                  <button
                    onClick={() => onDelete(file.id)}
                    className="p-1.5 hover:bg-red-100 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileAttachments
