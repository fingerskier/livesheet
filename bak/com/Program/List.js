import React from 'react'
import {useHREF} from '../../lib/HREFContext'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY, VIEW} from '../../constants'


export default function List() {
  const {link} = useHREF()
  const [programs, setPrograms] = useLocalStorage(KEY.PROGRAMS, [])
  
  
  return <div>
    <h2>Programs</h2>
    
    <ul>
      <li>
        <a href={link(VIEW.APP.PROGRAM.ADD.path)}>Add Program</a>
      </li>
      
      {programs.map((program,I)=>
        <li key={I}>
          {program.name || 'Untitled'}
          
          <a href={link(VIEW.APP.PROGRAM.EDIT.path, {programID: program.id})}>
            edit
          </a>
          
          <a href={link(VIEW.APP.PROGRAM.VIEW.path, {programID: program.id})}>
            view
          </a>
        </li>
      )}
    </ul>
  </div>
}
