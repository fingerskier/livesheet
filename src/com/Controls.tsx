import useLocalStore from '@/hook/useLocalStore'


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

    <button type='button'
      onClick={() => store.showMeta = !store.showMeta}
    >
      {store?.showMeta ? 'Hide Info' : 'Show Info'}
    </button>
  </div>
}