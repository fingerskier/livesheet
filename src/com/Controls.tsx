import React from 'react'
import useLocalStore from '@/hook/useLocalStore'

import style from '@/style/Controls.module.css'


export default function Controls() {
  const store = useLocalStore()


  return <div className='controls'>
    <button type='button'
      onClick={() => store.showChordset = !store.showChordset}
    >
      {store?.showChordset ? 'Hide Chordset' : 'Show Chordset'}
    </button>

    <button type='button'
      onClick={() => store.showChords = !store.showChords}
    >
      {store?.showChords ? 'Hide Chords' : 'Show Chords'}
    </button>
  </div>
}