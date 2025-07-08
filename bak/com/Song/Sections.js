import React from 'react'
import Section from './Section'


export default function Sections({
  data,
  onChange,
}) {
  const add = ()=>{
    onChange([...data, {name: '', chords: ''}])
  }
  
  
  return <div>
    <h3>Sections</h3>
    
    <ul>
      <li>
        <button onClick={add}>Add Section</button>
      </li>
      
      {data.map((section, I)=><Section
        data={section}
        key={I}
        index={I}
        onChange={data=>onChange(data.map((section, J)=>
          I===J ? section : section
        ))}
      />)}
    </ul>
  </div>
}