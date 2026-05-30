import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const STORE_KEY = 'tg_auth'

function loadAuth() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null }
  catch { return null }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadAuth)

  const login = useCallback((role, username) => {
    const next = { role, username }
    localStorage.setItem(STORE_KEY, JSON.stringify(next))
    setAuth(next)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORE_KEY)
    setAuth(null)
  }, [])

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
