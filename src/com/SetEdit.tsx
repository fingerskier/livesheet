import { useEffect, useState } from 'react'
import { useStateMachine } from 'ygdrassil'
import SetEditor from './SetEditor'
import { db, type Set, type SetSong } from '../lib/db'

export default function SetEdit() {
  const { query } = useStateMachine()
  const [record, setRecord] = useState<Set | null>(null)

  useEffect(() => {
    async function load() {
      if (!query.id) return
      await db.open()
      const found = await db.sets.get(query.id as string)
      if (found) setRecord(found)
    }
    load()
  }, [query.id])

  async function handleSave(data: { name: string, songs: SetSong[] }) {
    if (!record) return
    await db.open()
    await db.sets.put({ ...record, name: data.name, songs: data.songs })
  }

  if (!record) return <p>Select a set to edit.</p>

  return <SetEditor initialSet={record} onSave={handleSave} />
}
