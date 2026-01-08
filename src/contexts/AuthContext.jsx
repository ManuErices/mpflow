import { createContext, useContext, useEffect, useState } from 'react'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth } from '../firebase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Registrar usuario
  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Actualizar perfil con nombre
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      })
    }
    
    return userCredential
  }

  // Iniciar sesión
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Cerrar sesión
  const logout = () => {
    return signOut(auth)
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
