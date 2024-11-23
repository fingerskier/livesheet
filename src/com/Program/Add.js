import React from 'react'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY, VIEW} from '../../constants'
import {useHREF} from '../../lib/HREFContext'
import {v4 as uuid} from 'uuid'


export default function Add() {
  const [programs, setPrograms] = useLocalStorage(KEY.PROGRAMS, [])
  const {goto} = useHREF()
  
  
  const add = event=>{
    event.preventDefault()
    
    const form = event.target
    const formData = new FormData(form)
    
    const program = {
      id: uuid(),
      name: formData.get('name'),
    }
    
    setPrograms([...programs, program])
    
    goto(VIEW.APP.PROGRAM.EDIT.path, {programID: program.id})
    
    return false
  }
  
  
  return <div>
    <form onSubmit={add}>
      <label>
        Name:
        <input name="name" />
        
        <button>Add</button>
      </label>
    </form>
  </div>
}