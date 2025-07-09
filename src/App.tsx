import { useState } from 'react'
import { StateMachine, State } from 'ygdrassil'
import Controls from './com/Controls'
import Idle from './com/Idle'
import Songs from './com/Songs'
import SongAdd from './com/SongAdd'
import SongEdit from './com/SongEdit'
import Sets from './com/Sets'
import SetAdd from './com/SetAdd'
import SetEdit from './com/SetEdit'
import Live from './com/SetView'
import Settings from './com/Settings'
import Song from './com/SongView'

import './App.css'


export default function App() {
  return <>
    <StateMachine name='live' initial='idle' className='main container'>
      <Controls />

      <State name='idle'>
        <Idle />
      </State>

      <State name='songs'>
        <Songs />
      </State>

      <State name='song-add'>
        <SongAdd />
      </State>

      <State name='song-edit'>
        <SongEdit />
      </State>

      <State name='song-view'>
        <Song />
      </State>

      <State name='sets'>
        <Sets />
      </State>

      <State name='set-add'>
        <SetAdd />
      </State>

      <State name='set-edit'>
        <SetEdit />
      </State>

      <State name='set-view'>
        <Live />
      </State>

      <State name='settings'>
        <Settings />
      </State>
    </StateMachine>
  </>}