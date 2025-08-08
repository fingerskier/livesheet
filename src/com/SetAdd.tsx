import SetEditor from './SetEditor'
import { db, type SetSong } from '../lib/db'

export default function SetAdd() {
  async function handleSave(data: { name: string, songs: SetSong[] }) {
    await db.open()
    await db.sets.add({
      id: crypto.randomUUID(),
      name: data.name,
      date: Date.now(),
      songs: data.songs
    })
  }

  return <SetEditor onSave={handleSave} />
}
