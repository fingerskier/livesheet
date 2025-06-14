import React, {useState, useEffect} from 'react'
import useLocalStorage from '../../hook/useLocalStorage'
import useURL from '../../hook/useURL'
import {KEY} from '../../constants'
import {v4 as uuid} from 'uuid'
import View from './View'
import Icon from 'unicode-icons'


export default function Set() {
  const {query} = useURL()
  const [sets, setSets] = useLocalStorage(KEY.SETS, [])

  const [selectedSetId, setSelectedSetId] = useState(null)

  useEffect(() => {
    if (query?.id) {
      setSelectedSetId(query.id)
    }
  }, [query?.id])
  

  const getNextSunday = () => {
    const now = new Date()
    const day = now.getDay()
    const diff = day === 0 ? 7 : 7 - day
    const nextSunday = new Date(now)
    nextSunday.setDate(now.getDate() + diff)
    nextSunday.setHours(0, 0, 0, 0)
    return nextSunday.toISOString().slice(0, 16)
  }

  const add = () => {
    const name = window.prompt('Enter the name of the set')
    if (name) {
      const newId = uuid()
      setSets([...sets, { id: newId, name, datetime: getNextSunday(), songs: [] }])
    }
  }

  const remove = id => {
    const yes = window.confirm('Are you sure you want to remove this set?')
    if (yes) {
      setSets(sets.filter(set => set.id !== id))
      setSelectedSetId(null)
    }
  }



  return <>
    <h2>Sets</h2>
    <p>A set is a collection of songs that are played together.</p>

    {selectedSetId && <View setId={selectedSetId} />}

    <p>Your Sets:</p>
    <button onClick={add}>Add Set</button>

    <ul className='song list'>
      {Array.isArray(sets) && sets.map((set, index) => (
        <li key={index}>
          <a href={`?id=${set.id}#set`}>{set.name}</a>
          <button onClick={() => setSelectedSetId(set.id)}>{Icon.PENCIL}</button>
          <button onClick={() => remove(set.id)}>{Icon.RED_X}</button>
        </li>
      ))}
    </ul>
  </>
}
