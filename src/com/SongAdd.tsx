import { useState } from 'react'
import { db, type Song } from '../lib/db'

export default function SongAdd() {
  const [name, setName] = useState('')
  const [text, setText] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await db.open()
    const song: Song = {
      id: crypto.randomUUID(),
      name,
      text,
    }
    await db.songs.add(song)
    setName('')
    setText('')
  }

  return <form onSubmit={handleSubmit}>
    <label>Name <input value={name} onChange={e => setName(e.target.value)} /></label>
    <br />
    <textarea value={text} onChange={e => setText(e.target.value)} />
    <br />
    <button type='submit'>Save</button>
  </form>
}
