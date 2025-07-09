import React from 'react'
import useLocalStore from '@/hook/useLocalStore'


export default function Controls() {
  const store = useLocalStore()


  return <div className='controls'>
    <label>
      {store?.showChordset ? 'Hide Chordset' : 'Show Chordset'}

      <input
        type='checkbox'
        checked={store.showChordset}
        onChange={e => store.showChordset = e.target.checked}
      />
    </label>

    <label>
      {store.showChords ? 'Hide Chords' : 'Show Chords'}

      <input
        type='checkbox'
        checked={store.showChords}
        onChange={e => store.showChords = e.target.checked}
      />
    </label>
  </div>
}