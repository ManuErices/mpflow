// UpdateUserDisplayName.jsx
// Componente temporal para actualizar el displayName de usuarios

import { useState } from 'react'
import { updateProfile } from 'firebase/auth'
import { useAuth } from '../contexts/AuthContext'

function UpdateUserDisplayName() {
  const { user } = useAuth()
  const [newDisplayName, setNewDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpdate = async (e) => {
    e.preventDefault()
    
    if (!newDisplayName.trim()) {
      setMessage('❌ Por favor ingresa un nombre')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      await updateProfile(user, {
        displayName: newDisplayName.trim()
      })
      
      setMessage(`✅ Nombre actualizado a: "${newDisplayName.trim()}"`)
      setNewDisplayName('')
      
      // Recargar la página después de 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error) {
      console.error('Error al actualizar displayName:', error)
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#fff',
      border: '3px solid #0066cc',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      zIndex: 99999,
      maxWidth: '500px',
      width: '90%'
    }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#0066cc', fontSize: '24px' }}>
        🔧 Actualizar Nombre de Usuario
      </h2>
      
      <div style={{ 
        background: '#f0f7ff', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        <div><strong>Usuario actual:</strong> {user.email}</div>
        <div><strong>Nombre actual:</strong> {user.displayName || '(Sin nombre)'}</div>
        <div><strong>UID:</strong> <code style={{ fontSize: '11px' }}>{user.uid}</code></div>
      </div>

      <form onSubmit={handleUpdate}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600',
          fontSize: '14px'
        }}>
          Nuevo nombre para mostrar:
        </label>
        
        <input
          type="text"
          value={newDisplayName}
          onChange={(e) => setNewDisplayName(e.target.value)}
          placeholder="Ej: Manuel Erices"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
            marginBottom: '15px',
            boxSizing: 'border-box'
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#ccc' : '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '15px'
          }}
        >
          {loading ? '⏳ Actualizando...' : '✅ Actualizar Nombre'}
        </button>

        {message && (
          <div style={{
            padding: '12px',
            background: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}
      </form>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        fontSize: '13px'
      }}>
        <strong>⚠️ Importante:</strong>
        <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
          <li>Este cambio solo afecta a <strong>tu cuenta actual</strong></li>
          <li>Para cambiar otros usuarios, deben <strong>iniciar sesión ellos</strong></li>
          <li>El nombre se actualizará en toda la aplicación</li>
          <li>La página se recargará automáticamente después</li>
        </ul>
      </div>
    </div>
  )
}

export default UpdateUserDisplayName
