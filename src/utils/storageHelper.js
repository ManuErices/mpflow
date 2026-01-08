import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'

/**
 * Subir archivo a Firebase Storage
 * @param {File} file - Archivo a subir
 * @param {string} userId - ID del usuario
 * @param {Function} onProgress - Callback de progreso (opcional)
 * @returns {Promise<Object>} Información del archivo subido
 */
export const uploadFile = (file, userId, onProgress) => {
  return new Promise((resolve, reject) => {
    // Crear referencia única
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const storageRef = ref(storage, `attachments/${userId}/${fileName}`)

    // Subir archivo
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Progreso
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        if (onProgress) {
          onProgress(progress)
        }
      },
      (error) => {
        // Error
        console.error('Error al subir archivo:', error)
        reject(error)
      },
      async () => {
        // Completado - obtener URL
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          
          resolve({
            id: timestamp.toString(),
            name: file.name,
            type: file.type,
            size: file.size,
            url: downloadURL,
            path: `attachments/${userId}/${fileName}`,
            uploadedAt: new Date().toISOString()
          })
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

/**
 * Eliminar archivo de Firebase Storage
 * @param {string} filePath - Ruta del archivo en Storage
 */
export const deleteFile = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath)
    await deleteObject(fileRef)
    return true
  } catch (error) {
    console.error('Error al eliminar archivo:', error)
    throw error
  }
}

/**
 * Subir múltiples archivos
 * @param {FileList} files - Lista de archivos
 * @param {string} userId - ID del usuario
 * @param {Function} onProgress - Callback de progreso total (opcional)
 * @returns {Promise<Array>} Array de archivos subidos
 */
export const uploadMultipleFiles = async (files, userId, onProgress) => {
  const uploadPromises = []
  const totalFiles = files.length
  let completedFiles = 0

  for (let file of files) {
    const promise = uploadFile(file, userId, (fileProgress) => {
      // Calcular progreso total
      if (onProgress) {
        const totalProgress = ((completedFiles + (fileProgress / 100)) / totalFiles) * 100
        onProgress(totalProgress)
      }
    }).then((result) => {
      completedFiles++
      return result
    })
    
    uploadPromises.push(promise)
  }

  return Promise.all(uploadPromises)
}
