import React from 'react'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY, VIEW} from '../../constants'
import {useHREF} from '../../lib/HREFContext'
import {v4 as uuid} from 'uuid'


export default function Add() {
  const [songs, setSongs] = useLocalStorage(KEY.SONGS, [])
  const {goto} = useHREF()
  
  
  const add = event=>{
    event.preventDefault()
    
    const form = event.target
    const formData = new FormData(form)
    
    const song = {
      id: uuid(),
      name: formData.get('name'),
    }
    
    setSongs([...songs, song])
    
    goto(VIEW.APP.SONG.EDIT.path, {songID: song.id})
    
    return false
  }
  
  
  return <div>
    <h2>Add</h2>
    
    <form onSubmit={add}>
      <label>
        Name:
        <input name="name" />
      </label>
      
      <button type="submit">Add</button>
    </form>
  </div>
}