import React from 'react'
import {useHREF} from '../../lib/HREFContext'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY, VIEW} from '../../constants'


export default function List() {
  const {link} = useHREF()
  
  const [songs] = useLocalStorage(KEY.SONGS, [])
  
  
  return <div>
    <h2>Songs</h2>
    <ul>
      <li>
        <a href={link(VIEW.APP.SONG.ADD.path)}>Add Song</a>
      </li>
      
      {songs.map((song,I)=>
        <li key={I}>
          {song.name || 'Untitled'}
          
          <a href={link(VIEW.APP.SONG.EDIT.path, {songID: song.id})}>
            edit
          </a>
          
          <a href={link(VIEW.APP.SONG.VIEW.path, {songID: song.id})}>
            view
          </a>
        </li>
      )}
    </ul>
  </div>
}
