import {useEffect, useState} from 'react'
import {db, type Song} from '@/lib/db'
import {QRCodeSVG} from 'qrcode.react'

export default function Share() {
  const [songs, setSongs] = useState<Song[]>([])
  const [songId, setSongId] = useState('')

  useEffect(() => {
    async function load() {
      await db.open()
      const list = await db.songs.toArray()
      setSongs(list)
    }
    load()
  }, [])

  const song = songs.find(s => s.id === songId)
  const data = song ? JSON.stringify(song) : ''

  return <div>
    <h2>Share Song</h2>
    <select value={songId} onChange={e => setSongId(e.target.value)}>
      <option value=''>Select a song</option>
      {songs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
    {data && <div><QRCodeSVG value={data} size={200} /></div>}
  </div>
}
