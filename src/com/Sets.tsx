import { useEffect, useState } from 'react'
import { StateButton } from 'ygdrassil'
import { db, type Set } from '../lib/db'
import Icon from 'unicode-icons'

export default function Sets() {
  const [sets, setSets] = useState<Set[]>([])

  useEffect(() => {
    async function load() {
      await db.open()
      const list = await db.sets.toArray()
      setSets(list)
    }
    load()
  }, [])

  return <div>
    <h2>Sets</h2>
    <StateButton to='set-add'>{Icon.PLUS}</StateButton>
    <ul>
      {sets.map(set => <li key={set.id}>
        <StateButton to='set-edit' data={{ id: set.id }}>{set.name}</StateButton>
      </li>)}
    </ul>
  </div>
}
