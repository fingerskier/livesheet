import React from 'react'
import useLocalStorage from '../../hook/useLocalStorage'
import { KEY } from '../../constants'

export default function Display({ setId }) {
  const [songs] = useLocalStorage(KEY.LIST, [])
  const [sets] = useLocalStorage(KEY.SETS, [])

  const set = sets.find(s => s.id === setId)

  return (
    <div>
      <h2>Set: {set?.name}</h2>
      <p>{set?.datetime}</p>
      <ol className='song list'>
        {set?.songs?.map((entry, i) => {
          const song = songs.find(s => s.id === entry.songId)
          return (
            <li key={i}>
              <a href={`?id=${song?.id}#view`}>{song?.name}</a>
              {entry.arrangement ? ` (${entry.arrangement})` : ''}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
