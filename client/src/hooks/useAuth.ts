import { useState, useEffect } from 'react'

interface User {
  id: number
  email: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/me')
        const userData = await res.json()
        if (!res.ok) throw new Error(userData.error ?? 'Something went wrong')
        setUser(userData?.user ?? null)
      } catch {
        setUser(null)
      }
    }

    fetchUser()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const userData = await res.json()
    if (!res.ok) throw new Error(userData.error ?? 'Something went wrong')
    setUser(userData?.user)
  }

  const signup = async (email: string, password: string) => {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const userData = await res.json()
    if (!res.ok) throw new Error(userData.error ?? 'Something went wrong')

    await login(email, password)
  }

  const logout = async () => {
    const res = await fetch('/api/logout', {
      method: 'POST',
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error ?? 'Something went wrong')
    }
    setUser(null)
  }

  return { user, signup, login, logout }
}
