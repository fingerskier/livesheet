import { useState } from 'react'
import { db, login, logout } from '../lib/db'

export default function DexieLogin() {
  const [user, setUser] = useState(() => db.cloud.currentUser)

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const data = new FormData(form)
    const email = data.get('email') as string | null
    try {
      await login({ email: email ?? undefined })
      setUser(db.cloud.currentUser)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleLogout() {
    try {
      await logout()
      setUser(undefined)
    } catch (err) {
      console.error(err)
    }
  }

  if (user) {
    return <button onClick={handleLogout}>Logout {user?.username || user?.email}</button>
  }

  return <form onSubmit={handleLogin}>
    <input name='email' type='email' placeholder='Email' />
    <button type='submit'>Login</button>
  </form>
}
