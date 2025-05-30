import {useState} from 'react'
import useURL from '../hook/useURL'
import {STATE} from '../constants'
import BackButton from './BackButton'


export default function Header() {
  const {state, query} = useURL()
  const [debug, setDebug] = useState(false)
  
  return <header>
    <h1>
      <BackButton />
      <a href={`#${STATE.LIST}`}>
        LiveSheet
      </a>
      <button onClick={() => setDebug(!debug)}>?</button>
    </h1>
    
    {debug && <>
      State: {state} Query: {JSON.stringify(query)}
    </>}
  </header>
}