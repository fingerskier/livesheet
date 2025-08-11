import { useEffect, useState } from 'react'
import { db, type Song, type Set, type SetSong } from '../lib/db'
import songToHtml from '../lib/SongToHtml'
import Icon from 'unicode-icons'

export type SetSongState = {
  id: string
  name: string
  arrangement: string
  key: string
  arrangements: string[]
}

type Props = {
  initialSet?: Set | null
  onSave: (data: { name: string, songs: SetSong[] }) => Promise<void>
}

export default function SetEditor({ initialSet = null, onSave }: Props) {
  const [name, setName] = useState(initialSet?.name || '')
  const [songs, setSongs] = useState<SetSongState[]>([])
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [addSongId, setAddSongId] = useState('')

  useEffect(() => {
    async function loadSongs() {
      await db.open()
      const list = await db.songs.toArray()
      setAllSongs(list)
    }
    loadSongs()
  }, [])

  useEffect(() => {
    async function loadSet() {
      if (!initialSet) return
      await db.open()
      const items: SetSongState[] = []
      for (const s of initialSet.songs) {
        const song = await db.songs.get(s.songId)
        if (song) {
          const result = songToHtml(song.text)
          const arrs = result.arrangements
          items.push({
            id: song.id,
            name: song.name,
            arrangement: s.arrangement || arrs[0] || '',
            key: s.key || result.song.key || '',
            arrangements: arrs
          })
        }
      }
      setSongs(items)
      setName(initialSet.name)
    }
    loadSet()
  }, [initialSet])

  function updateSong(index: number, updates: Partial<SetSongState>) {
    setSongs(list => list.map((s, i) => i === index ? { ...s, ...updates } : s))
  }

  function moveSong(index: number, dir: number) {
    setSongs(list => {
      const res = [...list]
      const [item] = res.splice(index, 1)
      res.splice(index + dir, 0, item)
      return res
    })
  }

  function removeSong(index: number) {
    setSongs(list => list.filter((_, i) => i !== index))
  }

  function handleAddSong() {
    if (!addSongId) return
    const song = allSongs.find(s => s.id === addSongId)
    if (!song) return
    const result = songToHtml(song.text)
    const arrs = result.arrangements
    setSongs(list => [...list, {
      id: song.id,
      name: song.name,
      arrangement: arrs[0] || '',
      key: result.song.key || '',
      arrangements: arrs
    }])
    setAddSongId('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await onSave({
      name,
      songs: songs.map(s => ({ songId: s.id, arrangement: s.arrangement, key: s.key }))
    })
    setName('')
    setSongs([])
  }

  return <form onSubmit={handleSubmit}>
    <h2>Set</h2>
    <label>Name <input value={name} onChange={e => setName(e.target.value)} /></label>
    <div>
      <select value={addSongId} onChange={e => setAddSongId(e.target.value)}>
        <option value=''>Select song</option>
        {allSongs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <button type='button' onClick={handleAddSong}>{Icon.PLUS}</button>
    </div>
    <ul>
      {songs.map((s, i) => <li key={s.id}>
        {s.name}
        <select value={s.arrangement} onChange={e => updateSong(i, { arrangement: e.target.value })}>
          {s.arrangements.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <input value={s.key} onChange={e => updateSong(i, { key: e.target.value })} />
        <button type='button' disabled={i === 0} onClick={() => moveSong(i, -1)}>{Icon.ARROW.UP}</button>
        <button type='button' disabled={i === songs.length - 1} onClick={() => moveSong(i, 1)}>{Icon.ARROW.DOWN}</button>
        <button type='button' onClick={() => removeSong(i)}>{Icon.RED_X}</button>
      </li>)}
    </ul>
    <button type='submit'>Save</button>
  </form>
}
