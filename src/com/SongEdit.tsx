import { useEffect, useState } from 'react'
import { useStateMachine } from 'ygdrassil'
import { db, type Song } from '../lib/db'

export default function SongEdit() {
  const { query, gotoState } = useStateMachine()
  const [song, setSong] = useState<Song | null>(null)
  const [name, setName] = useState('')
  const [text, setText] = useState('')

  useEffect(() => {
    async function load() {
      if (query.id) {
        await db.open()
        const found = await db.songs.get(query.id as string)
        if (found) {
          setSong(found)
          setName(found.name)
          setText(found.text)
        }
      }
    }
    load()
  }, [query.id])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!song) return
    await db.songs.put({ ...song, name, text })
  }

  async function handleSaveAndView() {
    if (!song) return
    await db.songs.put({ ...song, name, text })
    gotoState('song-view', { id: song.id })
  }

  if (!song) return <p>Select a song to edit.</p>

  return <form className='song edit' onSubmit={handleSubmit}>
    <label>Name <input value={name} onChange={e => setName(e.target.value)} /></label>
    <br />
    <textarea value={text} onChange={e => setText(e.target.value)} />
    <br />
    <button type='submit'>Save</button>
    <button type='button' onClick={handleSaveAndView}>Save &amp; View</button>
  </form>
}
