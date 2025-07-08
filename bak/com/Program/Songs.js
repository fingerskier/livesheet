import React from 'react'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY, VIEW} from '../../constants'


export default function Songs({
  data,
  onChange,
}) {
  const [songs] = useLocalStorage(KEY.SONGS, [])
  
  
  const add = event=>{
    const id = event.target.value
    
    onChange([...data, id])
  }
  
  
  return <div>
    <h3>Songs</h3>
    
    <ul>
      <li>
        <select onChange={add}>
          <option value="">Add a Song</option>
          
          {songs.map((song,I)=><option value={song.id}>
            {song.name}
          </option>)}
        </select>
      </li>
      
      {data.map((song,I)=>{
        
      })}
    </ul>
  </div>
}
