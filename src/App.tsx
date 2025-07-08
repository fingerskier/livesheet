import { useState } from 'react'
import {StateMachine,State} from 'ygdrassil'
import Controls from './com/Controls'

import './App.css'


export default function App() {
  const [count, setCount] = useState(0)

  return <>
    <StateMachine name='live' initial='idle' className='main container'>
      <Controls />

      <State name='idle'>
        <p>Welcome to LiveSheet!</p>
      </State>

      <State name='songs'>
        <p>All Songs</p>
      </State>

      <State name='song-add'>
        <p>Add Song</p>
      </State>

      <State name='song-edit'>
        <p>Edit Song</p>
      </State>

      <State name='sets'>
        <p>All Sets</p>
      </State>

      <State name='set-add'>
        <p>Add Set</p>
      </State>

      <State name='set-edit'>
        <p>Edit Set</p>
      </State>

      <State name='live'>
        <p>Live Mode</p>
      </State>

      <State name='settings'>
        <p>Settings</p>
      </State>
    </StateMachine>
  </>
}