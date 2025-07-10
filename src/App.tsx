import {useState} from 'react'
import { StateMachine, State } from 'ygdrassil'
import Controls from '@/com/Controls'
import Navigation from '@/com/Navigation'
import Icon from 'unicode-icons'
import Idle from '@/com/Idle'
import Songs from '@/com/Songs'
import SongAdd from '@/com/SongAdd'
import SongEdit from '@/com/SongEdit'
import Sets from '@/com/Sets'
import SetAdd from '@/com/SetAdd'
import SetEdit from '@/com/SetEdit'
import Live from '@/com/SetView'
import Settings from '@/com/Settings'
import Song from '@/com/SongView'

import '@/style/App.css'


export default function App() {
  const [printMode, setPrintMode] = useState(false)

  return <>
    <button
      className='print mode button'
      type='button' onClick={() => setPrintMode(!printMode)}
    >
        {Icon.DEVICE.PRINTER}🖨️
    </button>

    <StateMachine name='live' initial='idle'>
      {!printMode && <Navigation />}

      <div className='main container'>
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
      </div>

      {!printMode && <Controls />}
    </StateMachine>
  </>}