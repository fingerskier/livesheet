import {useEffect, useState} from 'react'
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
import Share from '@/com/Share'
import ShareScan from '@/com/ShareScan'

import '@/style/App.css'


export default function App() {
  const [printMode, setPrintMode] = useState(false)
  
  useEffect(()=>{
    const elements = document.querySelectorAll('.dont.print')

    if (printMode) {
      elements.forEach(el => {
        el.classList.add('hidden')
      })
    } else {
      elements.forEach(el => {
        el.classList.remove('hidden')
      })
    }
  }, [printMode])
  
  
  return <>
    <button
      className='print mode button'
      type='button' onClick={()=>setPrintMode(!printMode)}
    >
        {Icon.DEVICE.PRINTER}🖨️
    </button>

    <StateMachine name='live' initial='idle'>
      <Navigation />

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

        <State name='share'>
          <Share />
        </State>

        <State name='share-scan'>
          <ShareScan />
        </State>

        <State name='settings'>
          <Settings />
        </State>
      </div>

      <Controls />
    </StateMachine>
  </>}