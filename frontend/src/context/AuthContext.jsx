import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ragqa_token')
    const storedUser = localStorage.getItem('ragqa_user')
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    const data = await api.login({ email, password })
    localStorage.setItem('ragqa_token', data.token)
    localStorage.setItem('ragqa_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  async function register(name, email, password, teamName) {
    const data = await api.register({ name, email, password, teamName })
    localStorage.setItem('ragqa_token', data.token)
    localStorage.setItem('ragqa_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  function logout() {
    localStorage.removeItem('ragqa_token')
    localStorage.removeItem('ragqa_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
