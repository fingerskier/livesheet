import React from 'react'
import {StateButton} from 'ygdrassil'


export default function Controls() {
  return <div className='controls'>
    <StateButton to='songs'>All Songs</StateButton>
    <StateButton to='song-add'>Add Song</StateButton>
    <StateButton to='sets'>All Sets</StateButton>
    <StateButton to='set-add'>Add Set</StateButton>
    <StateButton to='settings'>Settings</StateButton>
  </div>
}