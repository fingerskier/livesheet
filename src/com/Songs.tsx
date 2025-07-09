import { useEffect, useState } from 'react'
import { StateButton } from 'ygdrassil'
import { db, type Song } from '../lib/db'
import Icon from 'unicode-icons'


export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([])

  useEffect(() => {
    async function load() {
      await db.open()
      const list = await db.songs.toArray()
      setSongs(list)
    }
    load()
  }, [])
  
  
  return <div>
    <h2>Songs</h2>
    <ul>
      {songs.map(song => <li key={song.id}>
        <StateButton to='song-view' data={{id:song.id}}>{song.name}</StateButton>
        <StateButton to='song-edit' data={{id:song.id}}>{Icon.PENCIL}</StateButton>
      </li>)}
    </ul>
  </div>
}
